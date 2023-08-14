import React, { useState, useEffect } from "react";
import "./App.css";
import { Search } from "./components/Search/Search";
import { Catalog } from "./components/Catalog/Catalog";
import { Movie, convertMovie, getMovies, getMoviesFromIds } from "./services/movies.service";
import { MoviesContext } from "./services/context";

function App() {

  const url = new URL(window.location.href);

  const [movies, _setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [master, setMaster] = useState<Object[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [listName, setListName] = useState("");
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

    var init = src ? src : "master.json";
    fetch(init,
          { method: 'get',
            headers: {
              'content-type': 'text/csv;charset=UTF-8',
            }})
      .then((res) => res.json())
      .then((loadedSrc) => {
        setMaster(loadedSrc);
        console.log("loaded ", init);
        console.log("ids ", ids);
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

          getMoviesFromIds(loadedSrc, idsSet)
            .then((movies) => {
              setMovies(movies)
            });
        } 
        else if (title || year || runtime || watched || rating || tags || director || genre || country || writer || actor || studio)
        {
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
          getMoviesFromIds(loadedSrc, new Set([62,12477,531428,18491]))
            .then((movies) => {
              setMovies(movies)
            });
        }
      });
  }, []);

  return (
    <MoviesContext.Provider value={
    {master, movies, selected, updateMovies: setMovies,
     loading, listName, searchTitle, searchYear, searchRuntime, searchWatched, searchRating, searchTags, searchDirector, searchGenre, searchCountry, searchWriter, searchActor, searchStudio, searchSingleton, searchWatchlist, searchAvailable, searchSorting, searchRewatch, setLoading: setLoading, setSelected: setSelected, setListName: setListName }}>
      <div className="App">
        <div className="header">
          <h1 className="header__title">
            {listName !== ""? listName : "Abstract"}
          </h1>
          <div className="header__search">
            {
              listName === "" ? <Search></Search> : <span></span>
            }
          </div>
        </div>
        <Catalog></Catalog>
      </div>
    </MoviesContext.Provider>
  );
}

export default App;
