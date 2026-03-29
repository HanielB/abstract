import React, { useContext, useMemo } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { MoviesContext } from "../../services/context";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Colors);

export default function HomeChart() {
  const { master } = useContext(MoviesContext);

  const { labels, filmCounts, cinemaCounts, lastUpdate } = useMemo(() => {
    const films = new Map<string, number>();
    const cinema = new Map<string, number>();
    let latest = "";

    const movies = (master as any)?.movies ?? [];
    for (const movie of movies) {
      for (const entry of movie.diary ?? []) {
        const date = entry.date?.substring(0, 10) ?? "";
        if (!date) continue;
        const year = date.substring(0, 4);
        films.set(year, (films.get(year) || 0) + 1);
        if ((entry.tags ?? []).includes("cinema")) {
          cinema.set(year, (cinema.get(year) || 0) + 1);
        }
        if (date > latest) latest = date;
      }
    }

    const years = Array.from(films.keys()).sort();
    return {
      labels: years,
      filmCounts: years.map((y) => films.get(y) || 0),
      cinemaCounts: years.map((y) => cinema.get(y) || 0),
      lastUpdate: latest,
    };
  }, [master]);

  if (labels.length === 0) return null;

  const currentYear = new Date().getFullYear().toString();

  const data = {
    labels,
    datasets: [
      {
        label: "films",
        data: filmCounts,
        backgroundColor: "green",
        categoryPercentage: 1.0,
        barPercentage: 1,
        borderColor: "black",
        borderWidth: 1,
        grouped: false,
        order: 2,
      },
      {
        label: "cinema",
        data: cinemaCounts,
        backgroundColor: "purple",
        categoryPercentage: 1.0,
        barPercentage: 1.0,
        borderColor: "black",
        borderWidth: 1,
        grouped: false,
        order: 1,
      },
    ],
  };

  function handleBarClick(_event: any, elements: any[]) {
    if (elements.length === 0) return;
    const el = elements[0];
    const idx = el.index;
    const year = labels[idx];
    const baseUrl = window.location.pathname;
    const isCinema = el.datasetIndex === 1;
    const params = `?watched=${year}${isCinema ? "&tags=cinema" : ""}`;
    window.open(`${baseUrl}${params}`, "_blank");
  }

  const options: any = {
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
            const item = items[0];
            const year = labels[item.dataIndex];
            const isCurrentYear = year === currentYear;
            const prefix =
              item.dataset.label === "cinema"
                ? `In a cinema in ${year}`
                : `Logged in ${year}`;
            if (isCurrentYear && lastUpdate) {
              return `${prefix} (updated ${lastUpdate})`;
            }
            return prefix;
          },
        },
        displayColors: false,
        titleFont: { size: 14 },
        bodyFont: { size: 16 },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "black",
          font: { family: "Inter, system-ui, sans-serif", size: 18 },
        },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <div className="chart-wrapper">
      <Bar data={data} options={options} />
    </div>
  );
}
