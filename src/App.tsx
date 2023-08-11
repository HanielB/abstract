import React, { useState, useEffect } from "react";
import "./App.css";
import { Search } from "./components/Search/Search";
import { Catalog } from "./components/Catalog/Catalog";
import { Movie, convertMovie, getMovies, getMoviesFromIds } from "./services/movies.service";
import { MoviesContext } from "./services/context";

function App() {

  const url = new URL(window.location.href);

  useEffect(() => {
    const src = url.searchParams.get("src");
    const list = url.searchParams.get("list");
    const ids = url.searchParams.get("ids");
    let director = url.searchParams.get("director");
    var init = "master.json";
    if (src)
    {
      console.log("Set src to", src)
      init = src;
    }
    else if (list)
    {
      console.log("Set init to", init)
      init = "./lists/" + list + ".json";
    }
    fetch(init,
          { method: 'get',
            headers: {
              'content-type': 'text/csv;charset=UTF-8',
            }})
      .then((res) => res.json())
      .then((loadedSrc) => {
        setMaster(loadedSrc);
        console.log("loaded ", init);
        if (list)
        {
          setListName(loadedSrc.title)
          setMovies(loadedSrc.movies.map((movie) => convertMovie(movie)));
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
        else if (director)
        {
          console.log("Try loading director", director);
          getMovies(loadedSrc, "", "", "", "", "", "",
                    director, "", "", "", "", "",
                    "year", true, true, "", "yes")
            .then((movies) => {
              if (movies.length > 0)
              {
                const directors = new Set<string>();
                movies.map((movie) =>
                  {
                    if (movie.directors)
                    {
                      movie.directors.map((dirStr) => directors.add(dirStr));
                    }
                  }
                );
                director = ""
                let first = true
                directors.forEach((dirStr) => {
                  director = first? dirStr: director + ", " + dirStr
                  first = false
                })
              }
              setListName(director? director : "")
              setMovies(movies)
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

  const [movies, _setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [master, setMaster] = useState<Object[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [listName, setListName] = useState("");

  const setMovies = (movies) => {
    _setMovies([]);
    _setMovies(movies);
  };

  return (
    <MoviesContext.Provider value={
                              {master, movies, selected, updateMovies: setMovies,
                               loading, listName, setLoading: setLoading,
                               setSelected: setSelected, setListName: setListName }}>
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
