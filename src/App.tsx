import React, { useState, useEffect } from "react";
import "./App.css";
import { Header } from "./components/Header/Header";
import { Catalog } from "./components/Catalog/Catalog";
import { Movie } from "./services/movies.service";
import { MoviesContext } from "./services/context";

function App() {

  const url = new URL(window.location.href);

  useEffect(() => {
    const list = url.searchParams.get("list");
    var init = "favorites.json";
    console.log("Init is", init)
    if (list)
    {
      console.log("Set init to", list)
      init = list;
    }
    fetch(init,
          { method: 'get',
            headers: {
              'content-type': 'text/csv;charset=UTF-8',
            }})
      .then((res) => res.json())
      .then((loadedMovies) => setMovies(loadedMovies));
  }, []);

  // let obj =
  useEffect(() => {
    const src = url.searchParams.get("src");
    var init = "master.json";
    console.log("Src is", init)
    if (src)
    {
      console.log("Set src to", src)
      init = src;
    }
    fetch(init,
          { method: 'get',
            headers: {
              'content-type': 'text/csv;charset=UTF-8',
            }})
      .then((res) => res.json())
      .then((loadedSrc) => setMaster(loadedSrc));
  }, []);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [master, setMaster] = useState<Object[]>([]);

  return (
      <MoviesContext.Provider value={{master, movies, updateMovies: setMovies, loading, setLoading: setLoading }}>
      <div className="App">
        <Header></Header>
        <Catalog></Catalog>
      </div>
    </MoviesContext.Provider>
  );
}

export default App;
