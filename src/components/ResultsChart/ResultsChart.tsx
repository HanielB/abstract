import React, { useContext, useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { MoviesContext } from "../../services/context";
import "./ResultsChart.css";

type TimeUnit = "days" | "weeks" | "months" | "years";

// Parse "YYYY-MM-DD" as local time (not UTC)
function parseLocalDate(dateStr: string): Date {
  const s = dateStr.substring(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getISOWeekLabel(date: Date): string {
  // ISO week: year-weekNumber matching Python's isocalendar()
  // Use a UTC copy to avoid DST issues in the arithmetic
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function bucketKey(dateStr: string, unit: TimeUnit): string {
  const d = parseLocalDate(dateStr);
  if (isNaN(d.getTime())) return "";
  switch (unit) {
    case "days":
      return dateStr.substring(0, 10);
    case "weeks":
      return getISOWeekLabel(d);
    case "months":
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    case "years":
      return `${d.getFullYear()}`;
  }
}

function parseSearchDateRange(searchWatched: string): [Date, Date] | null {
  let date = searchWatched;
  // strip location part after ";"
  if (date.includes(";")) date = date.split(";")[0];
  if (!date || date === "-1") return null;
  if (date.startsWith("..")) date = "1900" + date;

  const split = date.split("..");
  const s0 = split[0];
  const sy = Number(s0.substring(0, 4));
  const sm = s0.length === 4 ? 0 : Number(s0.substring(4, 6)) - 1;
  const sd = s0.length <= 6 ? 1 : Number(s0.substring(6, 8));
  const start = new Date(sy, sm, sd);

  let end: Date;
  if (split.length === 1) {
    end = new Date(sy,
      s0.length === 4 ? 12 : sm + (s0.length <= 6 ? 1 : 0),
      s0.length <= 6 ? 0 : sd, 23, 59);
  } else if (split[1] === "") {
    end = new Date();
  } else {
    const s1 = split[1];
    const ey = Number(s1.substring(0, 4));
    const em = s1.length === 4 ? 12 : Number(s1.substring(4, 6)) - (s1.length <= 6 ? 0 : 1);
    const ed = s1.length <= 6 ? 0 : Number(s1.substring(6, 8));
    end = new Date(ey, em, ed, 23, 59);
  }
  return [start, end];
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fillGaps(buckets: Map<string, number>, unit: TimeUnit, range: [Date, Date] | null): [string, number][] {
  if (buckets.size === 0 && !range) return [];

  // For weeks: use bucketKey which maps to ISO weeks (may cross year boundaries)
  // For days/months/years: use strict date boundaries from the range
  let first: string, last: string;
  if (range) {
    const startStr = toLocalDateStr(range[0]);
    const endStr = toLocalDateStr(range[1]);
    if (unit === "weeks") {
      // Include any week that overlaps the range
      first = bucketKey(startStr, "weeks");
      last = bucketKey(endStr, "weeks");
    } else {
      first = bucketKey(startStr, unit);
      last = bucketKey(endStr, unit);
    }
  } else {
    if (buckets.size === 0) return [];
    const keys = Array.from(buckets.keys()).sort();
    first = keys[0];
    last = keys[keys.length - 1];
  }

  const allKeys: string[] = [];

  if (unit === "days") {
    const d = parseLocalDate(first);
    const end = parseLocalDate(last);
    while (d <= end) {
      allKeys.push(toLocalDateStr(d));
      d.setDate(d.getDate() + 1);
    }
  } else if (unit === "weeks") {
    const [fy, fw] = first.split("-").map(Number);
    const d = isoWeekToDate(fy, fw);
    const [ly, lw] = last.split("-").map(Number);
    const endDate = isoWeekToDate(ly, lw);
    while (d <= endDate) {
      allKeys.push(getISOWeekLabel(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (unit === "months") {
    const fy = parseInt(first.substring(0, 4));
    const fm = parseInt(first.substring(4, 6));
    const ly = parseInt(last.substring(0, 4));
    const lm = parseInt(last.substring(4, 6));
    let y = fy, m = fm;
    while (y < ly || (y === ly && m <= lm)) {
      allKeys.push(`${y}${String(m).padStart(2, "0")}`);
      m++;
      if (m > 12) { m = 1; y++; }
    }
  } else {
    const fy = parseInt(first);
    const ly = parseInt(last);
    for (let y = fy; y <= ly; y++) allKeys.push(`${y}`);
  }

  // For non-week units with a range, also filter out any bucket entries
  // outside the range (movies whose watched date falls outside the range
  // boundaries for this unit)
  const keySet = new Set(allKeys);
  const result: [string, number][] = allKeys.map(k => [k, 0]);
  for (const [k, v] of Array.from(buckets.entries())) {
    if (keySet.has(k)) {
      const idx = allKeys.indexOf(k);
      result[idx] = [k, v];
    }
  }
  return result;
}

function isoWeekToDate(isoYear: number, isoWeek: number): Date {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(isoYear, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Mon=1..Sun=7
  const monday1 = new Date(jan4);
  monday1.setDate(jan4.getDate() - dayOfWeek + 1);
  const result = new Date(monday1);
  result.setDate(monday1.getDate() + (isoWeek - 1) * 7);
  return result;
}

export default function ResultsChart() {
  const { movies, start, searchWatched } = useContext(MoviesContext);
  const [unit, setUnit] = useState<TimeUnit>("weeks");
  const unitRef = useRef<TimeUnit>(unit);
  unitRef.current = unit;
  const boundariesRef = useRef<number[]>([]);
  const monthNamesRef = useRef<string[]>([]);
  // For days view: week and month boundaries
  const dayWeekBoundariesRef = useRef<number[]>([]);
  const dayWeekNamesRef = useRef<string[]>([]);
  const dayMonthBoundariesRef = useRef<number[]>([]);
  const dayMonthNamesRef = useRef<string[]>([]);
  const labelCountRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const yAxisOverlayRef = useRef<HTMLCanvasElement>(null);


  const { labels, counts } = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const m of movies) {
      if (!m.watched) continue;
      const key = bucketKey(m.watched, unit);
      if (!key) continue;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const range = parseSearchDateRange(searchWatched);
    const filled = fillGaps(buckets, unit, range);
    return { labels: filled.map(([k]) => k), counts: filled.map(([, v]) => v) };
  }, [movies, unit, searchWatched]);

  if (start || labels.length === 0) return null;

  // For weeks view: compute month boundary ticks and centered month labels
  // for the secondary x-axis, matching process.py logic.
  // Months are derived from the searched date range, not from week labels.
  let monthBoundaryIndices: number[] = [];
  let monthCenterIndices: number[] = [];
  let monthNames: string[] = [];
  let weekMonthAxisLabels: string[] = [];
  if (unit === "weeks") {
    // Build the list of months in the range (from range, or from data)
    const range = parseSearchDateRange(searchWatched);
    let months: string[] = [];
    if (range) {
      let y = range[0].getFullYear(), m = range[0].getMonth() + 1;
      const ey = range[1].getFullYear(), em = range[1].getMonth() + 1;
      while (y < ey || (y === ey && m <= em)) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) { m = 1; y++; }
      }
    } else {
      // Derive months from week labels
      const monthSet = new Set<string>();
      for (const label of labels) {
        const [wy, ww] = label.split("-").map(Number);
        const monday = isoWeekToDate(wy, ww);
        monthSet.add(`${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}`);
      }
      months = Array.from(monthSet).sort();
    }

    // For each month, find the index of the first week of that month.
    // The first week of month M is the ISO week of the 1st day of M.
    const weekToIndex = new Map<string, number>();
    labels.forEach((l, i) => { if (!weekToIndex.has(l)) weekToIndex.set(l, i); });

    for (const mk of months) {
      const [my, mm] = mk.split("-").map(Number);
      const firstDay = new Date(my, mm - 1, 1);
      const weekLabel = getISOWeekLabel(firstDay);
      const idx = weekToIndex.get(weekLabel);
      if (idx !== undefined) {
        monthBoundaryIndices.push(idx);
      }
    }
    // Add last week index as final boundary
    monthBoundaryIndices.push(labels.length - 1);

    // Month labels go at the midpoint between consecutive boundaries
    for (let i = 1; i < monthBoundaryIndices.length; i++) {
      const center = Math.ceil((monthBoundaryIndices[i - 1] + monthBoundaryIndices[i]) / 2);
      monthCenterIndices.push(center);
      monthNames.push(months[i - 1].replace("-", ""));
    }

    // Build the label array for the secondary axis (empty except at centers)
    weekMonthAxisLabels = labels.map(() => "");
    for (let i = 0; i < monthCenterIndices.length; i++) {
      weekMonthAxisLabels[monthCenterIndices[i]] = monthNames[i];
    }
    boundariesRef.current = monthBoundaryIndices;
    monthNamesRef.current = monthNames;
  } else {
    boundariesRef.current = [];
    monthNamesRef.current = [];
  }

  // For days view: compute week and month boundaries
  if (unit === "days") {
    // Each label is "YYYY-MM-DD"
    // Week boundaries: find indices where the ISO week changes
    const weekBoundaries: number[] = [0]; // start
    const weekNames: string[] = [];
    let prevWeek = getISOWeekLabel(parseLocalDate(labels[0]));
    for (let i = 1; i < labels.length; i++) {
      const wk = getISOWeekLabel(parseLocalDate(labels[i]));
      if (wk !== prevWeek) {
        weekBoundaries.push(i);
        prevWeek = wk;
      }
    }
    weekBoundaries.push(labels.length - 1);
    // Week labels centered between boundaries
    for (let i = 1; i < weekBoundaries.length; i++) {
      const startIdx = weekBoundaries[i - 1];
      const wk = getISOWeekLabel(parseLocalDate(labels[startIdx]));
      weekNames.push(wk.split("-")[1]); // just the week number
    }
    dayWeekBoundariesRef.current = weekBoundaries;
    dayWeekNamesRef.current = weekNames;

    // Month boundaries: find indices where the month changes
    const monthBounds: number[] = [0];
    const monthNamesDays: string[] = [];
    let prevMonth = labels[0].substring(0, 7); // "YYYY-MM"
    for (let i = 1; i < labels.length; i++) {
      const mo = labels[i].substring(0, 7);
      if (mo !== prevMonth) {
        monthBounds.push(i);
        prevMonth = mo;
      }
    }
    monthBounds.push(labels.length - 1);
    for (let i = 1; i < monthBounds.length; i++) {
      const mo = labels[monthBounds[i - 1]].substring(0, 7);
      monthNamesDays.push(mo.replace("-", ""));
    }
    dayMonthBoundariesRef.current = monthBounds;
    dayMonthNamesRef.current = monthNamesDays;
  } else {
    dayWeekBoundariesRef.current = [];
    dayWeekNamesRef.current = [];
    dayMonthBoundariesRef.current = [];
    dayMonthNamesRef.current = [];
  }

  labelCountRef.current = labels.length;

  // For weeks/days: show simplified labels on the main x-axis
  let displayLabels: string[];
  if (unit === "weeks") {
    displayLabels = labels.map(l => l.split("-")[1]);
  } else if (unit === "days") {
    displayLabels = labels.map(l => String(parseInt(l.split("-")[2])));
  } else {
    displayLabels = labels;
  }

  const data = {
    labels: displayLabels,
    datasets: [
      {
        label: "films",
        data: counts,
        backgroundColor: "green",
        categoryPercentage: 1.0,
        barPercentage: 1,
        borderColor: "black",
        borderWidth: 1,
        xAxisID: "x",
      },
    ],
  };

  const scales: any = {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: true,
        color: "black",
      },
      ticks: {
        color: "black",
        font: { family: "Inter, system-ui, sans-serif", size: 11 },
        maxRotation: (unit === "weeks" || unit === "days") ? 0 : 90,
        autoSkip: false,
      },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: "black",
        font: { family: "Inter, system-ui, sans-serif", size: 12 },
        stepSize: (unit === "days" || unit === "weeks") ? 2 : 1,
        precision: 0,
        callback: (unit === "months" || unit === "years")
          ? function(value: string | number) {
              const v = typeof value === "string" ? parseFloat(value) : value;
              const valuesSet = new Set(counts);
              return valuesSet.has(v) ? v : null;
            }
          : undefined,
      },
      border: { display: false },
    },
  };

  function getPixelForIndex(xScale: any, idx: number, totalLabels: number): number {
    // Compute pixel position for a data index using the scale's pixel range
    // This avoids issues with duplicate label strings in category scales
    const left = xScale.left;
    const right = xScale.right;
    const step = (right - left) / totalLabels;
    return left + step * idx + step / 2;
  }

  function drawBoundaryAxis(chart: any, yTop: number, boundariesArr: number[], namesArr: string[], totalLabels: number) {
    const xScale = chart.scales.x;
    if (!xScale) return;
    const ctx = chart.ctx;
    const tickLen = 10;
    ctx.save();
    // Draw border line across the full width
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xScale.left, yTop);
    ctx.lineTo(xScale.right, yTop);
    ctx.stroke();
    // Draw boundary ticks
    const pixelPositions: number[] = [];
    for (const idx of boundariesArr) {
      const x = getPixelForIndex(xScale, idx, totalLabels);
      pixelPositions.push(x);
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yTop + tickLen);
      ctx.stroke();
    }
    // Draw centered labels between consecutive ticks
    ctx.fillStyle = "black";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < namesArr.length; i++) {
      const midX = (pixelPositions[i] + pixelPositions[i + 1]) / 2;
      ctx.fillText(namesArr[i], midX, yTop + tickLen + 2);
    }
    ctx.restore();
  }

  const AXIS_ROW_HEIGHT = 24;

  // Always present plugin - reads unit from ref to avoid stale closures
  const hierarchicalAxisPlugin = {
    id: "hierarchicalAxisTicks",
    afterDraw(chart: any) {
      const u = unitRef.current;
      if (u !== "weeks" && u !== "days") return;
      const n = labelCountRef.current;
      const xBottom = chart.scales.x.bottom;
      const extraRows = u === "days" ? 2 : 1;
      const extraStart = xBottom - extraRows * AXIS_ROW_HEIGHT;
      if (u === "weeks") {
        drawBoundaryAxis(chart, extraStart, boundariesRef.current, monthNamesRef.current, n);
      } else if (u === "days") {
        drawBoundaryAxis(chart, extraStart, dayWeekBoundariesRef.current, dayWeekNamesRef.current, n);
        drawBoundaryAxis(chart, extraStart + AXIS_ROW_HEIGHT, dayMonthBoundariesRef.current, dayMonthNamesRef.current, n);
      }
    }
  };

  // Plugin to copy the y-axis region onto a sticky overlay canvas
  const stickyYAxisPlugin = {
    id: "stickyYAxis",
    afterDraw(chart: any) {
      const overlay = yAxisOverlayRef.current;
      if (!overlay) return;
      const srcCanvas = chart.canvas;
      const yScale = chart.scales.y;
      if (!yScale) return;
      const dpr = window.devicePixelRatio || 1;
      const width = yScale.right + 1; // include the axis edge
      const cssW = width;
      const cssH = srcCanvas.clientHeight;

      overlay.width = Math.ceil(cssW * dpr);
      overlay.height = Math.ceil(cssH * dpr);
      overlay.style.width = cssW + "px";
      overlay.style.height = cssH + "px";

      const ctx = overlay.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      // Fill background to cover the chart beneath
      ctx.fillStyle = "#f5cc5b";
      ctx.fillRect(0, 0, overlay.width, overlay.height);
      // Copy the y-axis strip from the source canvas
      const srcW = Math.ceil(cssW * dpr);
      const srcH = srcCanvas.height;
      ctx.drawImage(srcCanvas, 0, 0, srcW, srcH, 0, 0, overlay.width, overlay.height);
    }
  };

  // Reserve space below the primary x-axis for secondary axes
  // Always set afterFit so it resets to 0 when switching to months/years
  const extraRows = (unit === "days") ? 2 : (unit === "weeks") ? 1 : 0;
  scales.x.afterFit = function(scale: any) {
    scale.height = scale.height + extraRows * AXIS_ROW_HEIGHT;
  };

  function labelToWatchedRange(label: string, u: TimeUnit): string {
    switch (u) {
      case "days":
        // label is "YYYY-MM-DD" → "YYYYMMDD"
        return label.replace(/-/g, "");
      case "weeks": {
        // label is "YYYY-WW", get Monday..Sunday
        const [wy, ww] = label.split("-").map(Number);
        const monday = isoWeekToDate(wy, ww);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return toLocalDateStr(monday).replace(/-/g, "") + ".." +
               toLocalDateStr(sunday).replace(/-/g, "");
      }
      case "months":
        // label is "YYYYMM"
        return label;
      case "years":
        // label is "YYYY"
        return label;
    }
  }

  function handleBarClick(event: any, elements: any[]) {
    if (elements.length === 0) return;
    const idx = elements[0].index;
    const fullLabel = labels[idx];
    const watchedRange = labelToWatchedRange(fullLabel, unit);

    // Build URL with current params but replace watched
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("watched", watchedRange);
    const baseUrl = window.location.pathname;
    window.open(baseUrl + "?" + currentParams.toString(), "_blank");
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleBarClick,
    plugins: {
      tooltip: {
        callbacks: {
          label(context: any) {
            return `${context.parsed.y} films`;
          },
          title(items: any[]) {
            // Show full week label (YYYY-WW) in tooltip for weeks view
            if (unit === "weeks") return labels[items[0].dataIndex];
            return items[0].label;
          },
        },
        displayColors: false,
        titleFont: { size: 14 },
        bodyFont: { size: 16 },
      },
      legend: { display: false },
    },
    scales,
  };

  return (
    <div className="results-chart">
      <div className="results-chart-controls">
        {(["days", "weeks", "months", "years"] as TimeUnit[]).map((u) => (
          <button
            key={u}
            className={`results-chart-btn${unit === u ? " active" : ""}`}
            onClick={() => setUnit(u)}
          >
            {u}
          </button>
        ))}
      </div>
      <div className="results-chart-viewport">
        <canvas ref={yAxisOverlayRef} className="results-chart-yaxis-overlay" />
        <div className="results-chart-wrapper" ref={wrapperRef}>
          <div className="results-chart-inner" style={{ minWidth: labels.length * 15 }}>
            <Bar data={data} options={options} plugins={[hierarchicalAxisPlugin, stickyYAxisPlugin]} />
          </div>
        </div>
      </div>
    </div>
  );
}
