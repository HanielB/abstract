#!/usr/bin/env python3
"""Generate clube/index.html (film club summary) from clube.md.

clube.md is all one has to edit; it is markdown, of the shape

    # Page title
    Page subtitle

    ## 2026-09-13
    A Suggested Film (1987)
    * The Film That Was Picked (1963)

    Free text about the meeting: ### headings, - lists, [links](url),
    *italics* and **bold** all work.

i.e. one "## <date>" section per meeting, one "<title> (<year>)" line per film,
a "*" marking the pick, and everything after the film lines is the text. When a
title is ambiguous, pin the film with its tmdb id: "The Silence (1998) #43974".

Everything else (poster, director, letterboxd link) is looked up on TMDB and
letterboxd, and cached in clube.cache.json, so regenerating needs no network.
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "clube.md")
CACHE = os.path.join(HERE, "clube.cache.json")
OUTDIR = os.path.join(HERE, "clube")
MASTER_JSON = os.path.join(HERE, "public", "master.json")
MASTER_ZIP = os.path.join(HERE, "public", "master.zip")

TMDB_KEY = os.environ.get("REACT_APP_API_KEY", "ff95187858254f0132358f557f352e99")
POSTER_URL = "https://image.tmdb.org/t/p/w300"
APP_URL = "https://hanielbarbosa.com/filminhos/"

MONTHS = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
          "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


def loadMaster():
    try:
        if os.path.exists(MASTER_JSON):
            with open(MASTER_JSON) as f:
                return json.load(f)["movies"]
        with zipfile.ZipFile(MASTER_ZIP) as z:
            return json.load(z.open("master.json"))["movies"]
    except Exception as e:
        print("could not load master: %s" % e, file=sys.stderr)
        return []


FILM_RE = re.compile(r"^(\*\s*)?(.+?)\s*\((\d{4})\)\s*(?:#(\d+))?$")


def parse(path):
    """Read clube.md into {title, subtitle, meetings[{date, films, text}]}."""
    data = {"title": "Filminhos Club", "subtitle": "", "meetings": []}
    meeting = None
    text = []
    with open(path) as f:
        lines = [l.rstrip("\n") for l in f]
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("## "):
            meeting = {"date": stripped[3:].strip(), "films": [], "text": ""}
            data["meetings"].append(meeting)
            text = []
            continue
        if stripped.startswith("# "):
            data["title"] = stripped[2:].strip()
            meeting = None
            continue
        if not stripped:
            if text:
                text.append("")
            continue
        if meeting is None:
            data["subtitle"] = stripped
            continue
        found = FILM_RE.match(stripped)
        if found and not text:
            meeting["films"].append({"title": found.group(2),
                                     "year": int(found.group(3)),
                                     "tmdbId": int(found.group(4)) if found.group(4) else None,
                                     "picked": bool(found.group(1))})
            continue
        text.append(stripped)
        meeting["text"] = markdown(text)
    return data


LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
ITALIC_RE = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")


def inline(text):
    """The bits of markdown one writes inside a line."""
    text = LINK_RE.sub(r'<a href="\2" target="_blank">\1</a>', text)
    text = BOLD_RE.sub(r"<b>\1</b>", text)
    text = ITALIC_RE.sub(r"<i>\1</i>", text)
    return text


def markdown(lines):
    """Headings, lists and blank-line separated paragraphs into html."""
    html = []
    para, items = [], []

    def flush():
        if para:
            html.append('<p class="notes">%s</p>' % inline(" ".join(para)))
            para.clear()
        if items:
            html.append('<ul class="notes">%s</ul>'
                        % "".join("<li>%s</li>" % inline(i) for i in items))
            items.clear()

    for line in lines:
        if not line:
            flush()
        elif line.startswith("#"):
            flush()
            level = len(line) - len(line.lstrip("#"))
            html.append("<h%d>%s</h%d>" % (min(level, 6),
                                           inline(line.lstrip("# ").strip()),
                                           min(level, 6)))
        elif line.startswith("- ") or line.startswith("+ "):
            if para:
                flush()
            items.append(line[2:].strip())
        else:
            if items:
                flush()
            para.append(line)
    flush()
    return "\n".join(html)


def tmdbGet(path, **params):
    params["api_key"] = TMDB_KEY
    url = "https://api.themoviedb.org/3/%s?%s" % (path, urllib.parse.urlencode(params))
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r)
    except Exception as e:
        print("tmdb request failed (%s): %s" % (path, e), file=sys.stderr)
        return None


def tmdbId(master, film):
    """Prefer the id in my database, fall back to a TMDB search."""
    for movie in master:
        titles = [movie.get("title"), movie.get("originalTitle")]
        if film["title"] in titles and movie.get("year") == film["year"]:
            return movie["tmdbId"]
    found = tmdbGet("search/movie", query=film["title"], year=film["year"])
    results = found.get("results", []) if found else []
    if not results:
        print("could not find %s (%s)" % (film["title"], film["year"]), file=sys.stderr)
        return None
    return results[0]["id"]


def lookup(film):
    """Poster and director of a film, from its tmdb id."""
    info = tmdbGet("movie/%s" % film["tmdbId"], append_to_response="credits")
    if not info:
        return None
    directors = [c["name"] for c in info.get("credits", {}).get("crew", [])
                 if c.get("job") == "Director"]
    return {"tmdbId": film["tmdbId"],
            "title": info.get("title"),
            "posterPath": info.get("poster_path"),
            "director": ", ".join(directors)}


def letterboxd(tmdbId):
    """The letterboxd page of a film, via letterboxd's own tmdb redirect."""
    url = "https://letterboxd.com/tmdb/%s/" % tmdbId
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as r:
            return r.url
    except Exception as e:
        print("letterboxd lookup failed for %s: %s" % (tmdbId, e), file=sys.stderr)
        return url


def resolve(master, cache, film):
    """Fill in the film entry from the cache, hitting the network only when new."""
    key = film.get("tmdbId") and str(film["tmdbId"])
    if not key:
        key = "%s (%s)" % (film["title"], film["year"])
    entry = cache.get(key)
    if not entry:
        if not film["tmdbId"]:
            film["tmdbId"] = tmdbId(master, film)
        if not film["tmdbId"]:
            return
        entry = lookup(film)
        if not entry:
            return
        cache[key] = entry
    if not entry.get("lbURL"):
        entry["lbURL"] = letterboxd(entry["tmdbId"])
    film.update({k: v for k, v in entry.items() if k != "title"})


def prettyDate(iso):
    d = date.fromisoformat(iso)
    return "%d de %s de %d" % (d.day, MONTHS[d.month], d.year)


def monthLabel(iso):
    month = MONTHS[date.fromisoformat(iso).month]
    return month[0].upper() + month[1:]


def filmLink(film):
    return film.get("lbURL")


def card(film):
    classes = "card picked" if film.get("picked") else "card"
    poster = ('<img class="poster" src="%s%s" alt="%s" loading="lazy"/>'
              % (POSTER_URL, film["posterPath"], film["title"])
              if film.get("posterPath") else '<div class="poster empty"></div>')
    inner = """
        %s
        <div class="info">
          <div class="title">%s <span class="year">%s</span></div>
          <div class="director">%s</div>
        </div>""" % (poster, film["title"], film["year"],
                     film.get("director", ""))
    link = filmLink(film)
    if link:
        return '<a class="%s" href="%s" target="_blank">%s</a>' % (classes, link, inner)
    return '<div class="%s">%s</div>' % (classes, inner)


def meetingSection(meeting):
    picked = any(f.get("picked") for f in meeting["films"])
    status = ("" if picked
              else '<div class="meta"><span class="pending">votação em aberto</span></div>')
    return """      <section class="meeting">
        <h2>%s <em>&sdot; %s</em></h2>
        %s
        <div class="cards">
%s
        </div>
%s
      </section>
""" % (monthLabel(meeting["date"]), prettyDate(meeting["date"]), status,
       "\n".join("          " + card(f) for f in meeting["films"]),
       meeting.get("text", ""))


HEAD = """<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>%(title)s</title>
    <style>
      body {
        background: #14181c;
        font-family: "Graphik", "Helvetica Neue", Helvetica, Arial, sans-serif;
        color: #9ab;
        margin: 0;
        padding: 0 0 60px 0;
      }
      #wrapper { width: 86%%; max-width: 1100px; margin: 50px auto 0 auto; }
      a { text-decoration: none; color: #9ab; }
      h1 {
        color: #def;
        font-size: 1.9em;
        font-weight: 600;
        margin: 0 0 6px 0;
      }
      .subtitle { color: #678; font-size: .95em; margin: 0 0 10px 0; }
      hr {
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        margin: 24px 0 0 0;
      }
      .meeting { padding: 30px 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .meeting h2 {
        color: #def;
        font-size: 1.3em;
        font-weight: 600;
        margin: 0;
      }
      .meeting h2 em { color: #678; font-style: normal; font-weight: normal; font-size: .8em; }
      .meta { font-size: .85em; margin: 6px 0 0 0; }
      .pending { color: #ff8000; }
      .cards { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 18px; }
      .card {
        display: block;
        position: relative;
        width: 150px;
        color: #9ab;
      }
      .poster {
        display: block;
        width: 150px;
        height: 225px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #2c3440;
      }
      .poster.empty { width: 150px; height: 225px; border-radius: 4px; background: #2c3440; }
      .card:hover .poster { border-color: #00e054; }
      .card.picked .poster {
        border: 2px solid #00e054;
        box-shadow: 0 0 14px rgba(0, 224, 84, 0.35);
      }
      .card:not(.picked) .poster { opacity: .65; }
      .card:not(.picked):hover .poster { opacity: 1; }
      .info { padding: 8px 2px 0 2px; font-size: .8em; line-height: 1.35; }
      .title { color: #def; }
      .card:not(.picked) .title { color: #9ab; }
      .year { color: #678; }
      .director { color: #678; }
      .notes { font-size: .95em; line-height: 1.55; margin: 22px 0 6px 0; max-width: 780px; }
      ul.notes { padding-left: 20px; }
      ul.notes li { margin-bottom: 4px; }
      .meeting h3 { color: #9ab; font-size: 1em; font-weight: 600; margin: 22px 0 -12px 0; }
      .notes a { color: #40bcf4; }
      .notes a:hover { color: #def; }
      .foot { font-size: .8em; color: #678; margin-top: 30px; }
      @media (max-width: 620px) {
        #wrapper { width: 92%%; margin-top: 30px; }
        .cards { gap: 12px; }
        .card, .poster, .poster.empty { width: 105px; }
        .poster, .poster.empty { height: 158px; }
      }
    </style>
  </head>
  <body>
    <div id="wrapper">
      <h1>%(title)s</h1>
      %(subtitle)s
      <hr>
"""

FOOT = """      <p class="foot">De volta ao <a href="%s">catálogo</a>.</p>
    </div>
  </body>
</html>
""" % APP_URL


def main():
    data = parse(DATA)
    master = loadMaster()
    cache = {}
    if os.path.exists(CACHE):
        with open(CACHE) as f:
            cache = json.load(f)
    for meeting in data["meetings"]:
        for film in meeting["films"]:
            resolve(master, cache, film)
    with open(CACHE, "w") as f:
        json.dump(cache, f, indent=1, ensure_ascii=False, sort_keys=True)
        f.write("\n")

    subtitle = ('<p class="subtitle">%s</p>' % inline(data["subtitle"])
                if data["subtitle"] else "")
    html = HEAD % {"title": data["title"], "subtitle": subtitle}
    for meeting in sorted(data["meetings"], key=lambda m: m["date"], reverse=True):
        html += meetingSection(meeting)
    html += FOOT

    os.makedirs(OUTDIR, exist_ok=True)
    with open(os.path.join(OUTDIR, "index.html"), "w") as f:
        f.write(html)
    print("wrote %s" % os.path.join(OUTDIR, "index.html"))


if __name__ == "__main__":
    main()
