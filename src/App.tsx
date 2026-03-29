import React, { useState, useEffect } from "react";
import "./App.css";
import { Search } from "./components/Search/Search";
import { Catalog } from "./components/Catalog/Catalog";
import ResultsChart from "./components/ResultsChart/ResultsChart";
import HomeChart from "./components/HomeChart/HomeChart";
import { Movie, convertMovie, getMovies, getMoviesFromIds } from "./services/movies.service";
import { MoviesContext } from "./services/context";

function App() {

  const url = new URL(window.location.href);

  const [movies, _setMovies] = useState<Movie[]>([]);
  const [start, setStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [master, setMaster] = useState<Object[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [listName, setListName] = useState("");
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
              getMoviesFromIds(loadedSrc, idsSet)
                .then((movies) => {setMovies(movies)})
            });
        }
        else if (ids)
        {
          let idsArray = ids.split(";");
          let idsSet = new Set(idsArray.map((id) => Number(id)));

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
          getMoviesFromIds(loadedSrc, new Set([62,12477,843,531428]))
            .then((movies) => {
              setMovies(movies)
            });
        }
                                    });
                                    }, []);

  return (
    <MoviesContext.Provider value={
    {master, movies, selected, updateMovies: setMovies,
     start, loading, listName, searchTitle, searchYear, searchRuntime, searchWatched, searchRating, searchTags, searchDirector, searchGenre, searchCountry, searchWriter, searchActor, searchStudio, searchSingleton, searchWatchlist, searchAvailable, searchSorting, searchRewatch, setSearchWatched, setSearchSingleton, cardsPerRow, setCardsPerRow, setStart: setStart, setLoading: setLoading, setSelected: setSelected, setListName: setListName }}>
      <div className="App">
        <div className="header">
          <h1 className="header__title">
            {listName !== ""? listName : "Abstract"}
          </h1>
          <div className="header__search">
            {
              listName === "" ? <Search></Search> :
              <div className="header-slider">
                <label>Cards per row</label>
                <input
                  type="range"
                  min="1"
                  max="10"
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
            }
          </div>
        </div>
        <Catalog></Catalog>
        <ResultsChart />
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
             <a href="https://hanielbarbosa.com/filminhos/?list=2025best">2025</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2024best">2024</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2023best">2023</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2022best">2022</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2021best">2021</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2020best">2020</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2019best">2019</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2018best">2018</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2017best">2017</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2016best">2016</a>
             <a href="https://hanielbarbosa.com/filminhos/?list=2015best">2015</a>
           </div>
           <h2 className="header__title">Films per year</h2>
           <HomeChart />
           </div>
         :<div></div>}
      </div>
    </MoviesContext.Provider>
  );
}

export default App;
