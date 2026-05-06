import React, { useState, useEffect } from "react";
import "./App.css";
import { Search } from "./components/Search/Search";
import { Catalog } from "./components/Catalog/Catalog";
import ResultsChart from "./components/ResultsChart/ResultsChart";
import HomeChart from "./components/HomeChart/HomeChart";
import { Movie, convertMovie, getMovies, getMoviesFromIds } from "./services/movies.service";
import { MoviesContext } from "./services/context";

interface ListEntry { file: string; title: string; count: number; preview: number[]; tags?: string[]; }

const CAT_BEST_OF       = "Best of";
const CAT_TOPNEW        = "Best first watched (newer)";
const CAT_HONORABLE     = "Honorable mentions";
const CAT_TOPOLD        = "Best first watched (older)";
const CAT_MISC          = "Misc rankings";
const CAT_PROJECTS      = "Projects";
const CAT_PHYSICAL      = "Physical media";
const CAT_DIRECTORS     = "Directors, ranked";
const CAT_OTHER         = "Other";
const CAT_SHOWDOWN      = "LB Showdown";

const TOP_LEVEL_CATEGORIES = [
  CAT_BEST_OF,
  CAT_TOPNEW,
  CAT_TOPOLD,
  CAT_MISC,
  CAT_PROJECTS,
  CAT_PHYSICAL,
  CAT_DIRECTORS,
  CAT_OTHER,
  CAT_SHOWDOWN,
];
const NESTED_OF: Record<string, string[]> = { [CAT_TOPNEW]: [CAT_HONORABLE] };
const COLLAPSED_BY_DEFAULT = new Set([CAT_BEST_OF, CAT_HONORABLE]);

function categorizeList(entry: ListEntry): string {
  const tags = entry.tags || [];
  if (tags.includes("honorablementions")) return CAT_HONORABLE;
  if (tags.includes("topnew"))            return CAT_TOPNEW;
  if (tags.includes("topold"))            return CAT_TOPOLD;
  if (tags.includes("topyear"))           return CAT_BEST_OF;
  if (tags.includes("topother"))          return CAT_MISC;
  if (tags.includes("projects"))          return CAT_PROJECTS;
  if (tags.includes("physicalmedia"))     return CAT_PHYSICAL;
  if (tags.includes("directors"))         return CAT_DIRECTORS;
  if (tags.some(t => t.startsWith("showdown:"))) return CAT_SHOWDOWN;
  return CAT_OTHER;
}

function WatchedProgress({ listMaster }: { listMaster: any }) {
  const movies = listMaster?.movies;
  if (!Array.isArray(movies) || movies.length === 0) return null;
  const total = movies.length;
  const watched = movies.filter((m: any) => m.status && m.status !== 0).length;
  if (watched >= total) return null;
  const pct = Math.round((watched / total) * 100);
  return (
    <div className="watchedProgress">
      <div className="watchedProgressRow">
        <div className="watchedProgressLabel">
          <div>You&rsquo;ve watched</div>
          <div className="watchedProgressFraction">{watched} of {total}</div>
        </div>
        <div className="watchedProgressPercent">
          {pct}<span className="watchedProgressPercentSign">%</span>
        </div>
      </div>
      <div className="watchedProgressBar">
        <div className="watchedProgressBarFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ListsPopup({ master, onClose }: { master: any[]; onClose: () => void }) {
  const [lists, setLists] = useState<ListEntry[]>([]);
  const [titleFilter, setTitleFilter] = useState("");
  useEffect(() => {
    fetch("./lists/index.json")
      .then(res => res.json())
      .then((data: ListEntry[]) => setLists(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Build poster lookup from master
  const posterMap = React.useMemo(() => {
    const map = new Map<number, string>();
    const movies = Array.isArray(master) ? master : (master as any).movies;
    if (!movies) return map;
    for (let i = 0; i < movies.length; i++) {
      const m = movies[i] as any;
      if (m.tmdbId && m.posterPath) map.set(Number(m.tmdbId), m.posterPath);
    }
    return map;
  }, [master]);

  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set(COLLAPSED_BY_DEFAULT));

  const needle = titleFilter.trim().toLowerCase();
  const filtered = needle ? lists.filter(e => e.title.toLowerCase().includes(needle)) : lists;

  const grouped = new Map<string, ListEntry[]>();
  for (const entry of filtered) {
    const cat = categorizeList(entry);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(entry);
  }
  // Reverse-chronological order for year-keyed buckets.
  grouped.get(CAT_BEST_OF)?.sort((a, b) => b.file.localeCompare(a.file));
  grouped.get(CAT_TOPNEW)?.sort((a, b) => b.file.localeCompare(a.file));
  grouped.get(CAT_TOPOLD)?.sort((a, b) => b.file.localeCompare(a.file));

  // A category is shown collapsed unless: (a) the user has manually expanded it,
  // or (b) a search is active and it has matches under the current filter.
  const hasContent = (cat: string): boolean => {
    if ((grouped.get(cat) || []).length > 0) return true;
    return (NESTED_OF[cat] || []).some(hasContent);
  };
  const isCollapsed = (cat: string): boolean => {
    if (!collapsedCats.has(cat)) return false;
    if (needle && hasContent(cat)) return false;
    return true;
  };
  const toggle = (cat: string) => setCollapsedCats(prev => {
    const next = new Set(prev);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return next;
  });

  const renderListCard = (entry: ListEntry) => (
    <a key={entry.file} href={`?list=${entry.file}`} className="listCard">
      <div className="listCardPosters">
        {entry.preview.map((id, i) => {
          const poster = posterMap.get(id);
          return poster
            ? <img key={i} src={`https://image.tmdb.org/t/p/w92${poster}`} alt="" className="listCardPoster" />
            : <div key={i} className="listCardPosterPlaceholder" />;
        })}
      </div>
      <div className="listCardInfo">
        <span className="listCardTitle">{entry.title}</span>
        <span className="listCardCount">{entry.count} films</span>
      </div>
    </a>
  );

  const renderCategory = (cat: string, depth: number = 0): React.ReactNode => {
    if (!hasContent(cat)) return null;
    const items = grouped.get(cat) || [];
    const collapsed = isCollapsed(cat);
    const wrapperClass = depth === 0 ? "listsCategory" : "listsCategoryNested";
    const titleClass   = depth === 0 ? "listsCategoryTitle" : "listsCategoryTitleNested";
    return (
      <div key={cat} className={wrapperClass}>
        <h3 className={titleClass} onClick={() => toggle(cat)}>
          {collapsed ? "\u25b6" : "\u25bc"} {cat}
        </h3>
        {!collapsed && (
          <>
            {items.length > 0 && <div className="listsGrid">{items.map(renderListCard)}</div>}
            {(NESTED_OF[cat] || []).map(sub => renderCategory(sub, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="listsOverlay" onClick={onClose}>
      <div className="listsModal" onClick={e => e.stopPropagation()}>
        <div className="listsModalHeader">
          <h2>Lists</h2>
          <button className="listsModalClose" onClick={onClose}>&times;</button>
        </div>
        <div className="listsModalSearch">
          <input
            type="text"
            className="listsModalSearchInput"
            placeholder="Search lists by title..."
            value={titleFilter}
            onChange={e => setTitleFilter(e.target.value)}
            autoFocus
          />
        </div>
        <div className="listsModalBody">
          {TOP_LEVEL_CATEGORIES.map(cat => renderCategory(cat))}
        </div>
      </div>
    </div>
  );
}

function App() {

  const url = new URL(window.location.href);

  const [movies, _setMovies] = useState<Movie[]>([]);
  const [start, setStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [master, setMaster] = useState<Object[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [listName, setListName] = useState("");
  const [posterOnly, setPosterOnly] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(() => {
    const saved = localStorage.getItem("cardsPerRow");
    return saved ? parseInt(saved, 10) : 4;
  });
  const [searchTitle, setSearchTitle] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [searchRuntime, setSearchRuntime] = useState("");
  const [searchWatched, setSearchWatched] = useState("");
  const [searchRating, setSearchRating] = useState("");
  const [searchTags, setSearchTags] = useState("");
  const [searchDirector, setSearchDirector] = useState("");
  const [searchGenre, setSearchGenre] = useState("");
  const [searchCountry, setSearchCountry] = useState("");
  const [searchWriter, setSearchWriter] = useState("");
  const [searchActor, setSearchActor] = useState("");
  const [searchStudio, setSearchStudio] = useState("");
  const [searchSingleton, setSearchSingleton] = useState("");
  const [searchWatchlist, setSearchWatchlist] = useState("");
  const [searchSorting, setSearchSorting] = useState("");
  const [searchRewatch, setSearchRewatch] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [showLists, setShowLists] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [listMaster, setListMaster] = useState<any>(null);

  const setMovies = (movies) => {
    _setMovies([]);
    _setMovies(movies);
  };

  useEffect(() => {
    const src = url.searchParams.get("src");
    const list = url.searchParams.get("list");
    const ids = url.searchParams.get("ids");
    let header   = url.searchParams.get("header");
    let title    = url.searchParams.get("title");
    let year     = url.searchParams.get("year");
    let runtime  = url.searchParams.get("runtime");
    let watched  = url.searchParams.get("watched");
    let rating   = url.searchParams.get("rating");
    let tags     = url.searchParams.get("tags");
    let director = url.searchParams.get("director");
    let genre    = url.searchParams.get("genre");
    let country  = url.searchParams.get("country");
    let writer   = url.searchParams.get("writer");
    let actor    = url.searchParams.get("actor");
    let studio   = url.searchParams.get("studio");
    let sorting   = url.searchParams.get("sorting");
    let rewatch   = url.searchParams.get("rewatch");
    let singleton   = url.searchParams.get("singleton");
    let watchlist   = url.searchParams.get("watchlist");
    let available   = url.searchParams.get("available");

    const JSZip = require('jszip');

    var init = src ? src : "master.zip";

    fetch(init)
      .then((response) => response.arrayBuffer())
      .then((zipData) => {
        // Create a new JSZip instance
        const zip = new JSZip();

        // Load the zip file content
        return zip.loadAsync(zipData, { base64: false });
      })
      .then((zip) => {
        // Assuming there's a single JSON file in the zip archive, you
        // can access it like this:
        const jsonFile = zip.files['master.json'];
        // Read the content of the JSON file
        return jsonFile.async('string');
      })
      .then((res) => JSON.parse(res))
      .then((loadedSrc) => {
        setMaster(loadedSrc);
        console.log("loaded ", init);
        console.log("ids ", ids);
        if (title)
          setSearchTitle(title.replaceAll("_"," "));
        else
          title = ""
        if (year)
          setSearchYear(year);
        else
          year = ""
        if (runtime)
          setSearchRuntime(runtime);
        else
          runtime = ""
        if (watched)
          setSearchWatched(watched);
        else
          watched = ""
        if (rating)
          setSearchRating(rating);
        else
          rating = ""
        if (tags)
          setSearchTags(tags);
        else
          tags = ""
        if (director)
          setSearchDirector(director.replaceAll("_"," "));
        else
          director = ""
        if (writer)
          setSearchWriter(writer.replaceAll("_"," "));
        else
          writer = ""
        if (actor)
          setSearchActor(actor.replaceAll("_"," "));
        else
          actor = ""
        if (genre)
          setSearchGenre(genre.replaceAll("_"," "));
        else
          genre = ""
        if (country)
          setSearchCountry(country.replaceAll("_"," "));
        else
          country = ""
        if (studio)
          setSearchStudio(studio.replaceAll("_"," "));
        else
          studio = ""
        if (sorting)
          setSearchSorting(sorting)
        else
          sorting = "watched"
        if (rewatch)
          setSearchRewatch(rewatch)
        else
          rewatch = "yes"
        if (available)
          setSearchAvailable(available)
        else
          available = "no"
        let singletonV = false;
        if (singleton)
        {
          singletonV = singleton === "1"
          setSearchSingleton(singleton)
        }
        let watchlistV = false;
        if (watchlist)
        {
          watchlistV = watchlist === "1"
          setSearchWatchlist(watchlist)
        }

        if (list)
          {
          fetch("./lists/" + list + ".json",
          { method: 'get',
            headers: {
              'content-type': 'text/csv;charset=UTF-8',
            }})
            .then((resList) => resList.json())
            .then((resList) => {
              setListName(resList.title);
              console.log("Loading list ", resList.title, ": ids ", resList.movies);
              let idsSet = new Set<Number>(resList.movies.map((id) => Number(id)));
              setListMaster({movies: loadedSrc.movies.filter((m: any) => idsSet.has(m.tmdbId))});
              getMoviesFromIds(loadedSrc, idsSet)
                .then((movies) => {setMovies(movies)})
            });
        }
        else if (ids)
        {
          let idsArray = ids.split(";");
          let idsSet = new Set(idsArray.map((id) => Number(id)));
          setListMaster({movies: loadedSrc.movies.filter((m: any) => idsSet.has(m.tmdbId))});

          if (header)
          {
            setListName(header.replaceAll("_", " "));
          }

          getMoviesFromIds(loadedSrc, idsSet)
            .then((movies) => {
              console.log("Got these many movies: ", movies.length)
              if (title)
                setSearchTitle(title.replaceAll("_"," "));
              else
                title = ""
              if (year)
                setSearchYear(year);
              else
                year = ""
              if (runtime)
                setSearchRuntime(runtime);
              else
                runtime = ""
              if (watched)
                setSearchWatched(watched);
              else
                watched = ""
              if (rating)
                setSearchRating(rating);
              else
                rating = ""
              if (tags)
                setSearchTags(tags);
              else
                tags = ""
              if (director)
                setSearchDirector(director.replaceAll("_"," "));
              else
                director = ""
              if (writer)
                setSearchWriter(writer.replaceAll("_"," "));
              else
                writer = ""
              if (actor)
                setSearchActor(actor.replaceAll("_"," "));
              else
                actor = ""
              if (genre)
                setSearchGenre(genre.replaceAll("_"," "));
              else
                genre = ""
              if (country)
                setSearchCountry(country.replaceAll("_"," "));
              else
                country = ""
              if (studio)
                setSearchStudio(studio.replaceAll("_"," "));
              else
                studio = ""
              if (sorting)
                setSearchSorting(sorting)
              else
                sorting = "watched"
              if (rewatch)
                setSearchRewatch(rewatch)
              else
                rewatch = "yes"
              if (available)
                setSearchAvailable(available)
              else
                available = "no"
              let singletonV = false;
              if (singleton)
              {
                singletonV = singleton === "1"
                setSearchSingleton(singleton)
              }
              let watchlistV = false;
              if (watchlist)
              {
                watchlistV = watchlist === "1"
                setSearchWatchlist(watchlist)
              }
              /* return getMovies(movies, title, year, watched, rating, runtime, tags,
               *                  director, writer, actor, genre, country, studio,
               *                  sorting, singletonV, watchlistV, rewatch, available); */
              return movies;
            })
            .then((movies) => setMovies(movies));
        }
        else if (title || year || runtime || watched || rating || tags || director || genre || country || writer || actor || studio)
        {
          getMovies(loadedSrc, title, year, watched, rating, runtime, tags,
                    director, writer, actor, genre, country, studio,
                    sorting, singletonV, watchlistV, rewatch, available)
            .then((movies) => {
              if (header)
              {
                setListName(header.replaceAll("_", " "));
              }
              setMovies(movies);
            });
        }
        else
        {
          // 2001, Hotaru no Haka, In the Mood for Love, Protrait de la Jeune Fille en Feu
          setStart(true);
          getMoviesFromIds(loadedSrc, new Set([62,12477,843,531428,335,79,18148,11423,670,426]))
            .then((movies) => {
              movies.sort((a, b) => Number(a.year) - Number(b.year));
              setMovies(movies)
            });
        }
                                    });
                                    }, []);

  return (
    <MoviesContext.Provider value={
    {master, movies, selected, updateMovies: setMovies,
     start, loading, listName, searchTitle, searchYear, searchRuntime, searchWatched, searchRating, searchTags, searchDirector, searchGenre, searchCountry, searchWriter, searchActor, searchStudio, searchSingleton, searchWatchlist, searchAvailable, searchSorting, searchRewatch, setSearchWatched, setSearchRating, setSearchTags, setSearchTitle, setSearchYear, setSearchRuntime, setSearchDirector, setSearchWriter, setSearchActor, setSearchGenre, setSearchCountry, setSearchStudio, setSearchSingleton, setSearchWatchlist, setSearchAvailable, setSearchSorting, setSearchRewatch, posterOnly, setPosterOnly, cardsPerRow, setCardsPerRow, setStart: setStart, setLoading: setLoading, setSelected: setSelected, setListName: setListName, showLists, setShowLists, listMaster }}>
      <div className="App">
        <div className="header">
          <h1 className="header__title">
            {listName !== ""? listName : "Abstract"}
          </h1>
          <div className="header__search">
            {
              listName === "" ? <Search></Search> :
              showSearch ? <>
                <Search></Search>
                <button className="listsButton" style={{marginTop: "0.5rem"}} onClick={() => setShowSearch(false)}>Hide search</button>
              </> : <>
              <div className="header__searchRow">
                <button className="listsButton" onClick={() => setShowSearch(true)}>Search</button>
                <WatchedProgress listMaster={listMaster} />
              </div>
              <div className="header-slider">
                <div>
                  <input type="checkbox" id="posteronly-list" checked={posterOnly} onChange={(e) => {
                    setPosterOnly(e.target.checked);
                    if (!e.target.checked && cardsPerRow > 10) {
                      setCardsPerRow(10);
                      localStorage.setItem("cardsPerRow", "10");
                    }
                  }} />
                  <label htmlFor="posteronly-list">No card</label>
                </div>
                <div>
                  <label>Row size</label>
                  <input
                    key={posterOnly ? "poster" : "card"}
                    type="range"
                    min="1"
                    max={posterOnly ? 20 : 10}
                    step="1"
                    title={`${cardsPerRow}`}
                    value={cardsPerRow}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCardsPerRow(val);
                      localStorage.setItem("cardsPerRow", val.toString());
                    }}
                  />
                </div>
              </div></>
            }
          </div>
        </div>
        <Catalog></Catalog>
        {listName === "" && <ResultsChart />}
        {start?
         <div className="header">
           <h2 className="header__title">Year in review</h2>
           <div className="box-link">
             <a href="year-review/2025.html">2025</a>
             <a href="year-review/2024.html">2024</a>
             <a href="year-review/2023.html">2023</a>
           </div>
           <h2 className="header__title">Best of</h2>
           <div className="box-link">
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2025">2025</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2024">2024</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2023">2023</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2022">2022</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2021">2021</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2020">2020</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2019">2019</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2018">2018</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2017">2017</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2016">2016</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=best-of-2015">2015</a>
           </div>
           <h2 className="header__title">Films per year</h2>
           <HomeChart />
           </div>
         :<div></div>}
        {showLists && <ListsPopup master={master} onClose={() => setShowLists(false)} />}
      </div>
    </MoviesContext.Provider>
  );
}

export default App;
