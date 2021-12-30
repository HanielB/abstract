import React, { useState, useContext } from "react";
import "./Search.css";

import { searchMovies, getMovie, loadMovies } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";

import script from './python/main.py';

// const runScript = async (code) => {
//   const pyodide = await window.loadPyodide({
//     indexURL : "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
//   });

//   await pyodide.loadPackage("datetime");
//   // await pyodide.loadPackage("micropip");

//   // pyodide.runPythonAsync(`
//   // import micropip
//   // await micropip.install('python-datetutil')
//   // `);
//   await pyodide.loadPackage("python-dateutil");

//   const watchedText =
//         await (await fetch(`test.csv`,
//                            {
//                              method: 'get',
//                              headers: {
//                                'content-type': 'text/csv;charset=UTF-8',
//                              }
//                            })).text();
//   console.log("Read from watched: " + watchedText)
//   // const watchedCsv = await Papa.parse(watchedText);
//   // console.log("Papa parsed: " + watchedCsv)

//   const headers = watchedText.slice(0, watchedText.indexOf("\n")).split(",");
//   const rowsFlat = watchedText.slice(watchedText.indexOf("\n") + 1).split("\n");

//   const rows = rowsFlat.map((row) => row.split(","));

//   console.log("Headers (" + headers.length + "): " + headers);
//   console.log("Rows: (" + rows.length + "): " + rows.forEach((r) => console.log("\n\t" + r.length + ": " + r)));

//   let my_js_namespace = { x : watchedText, w : rows };
//   pyodide.registerJsModule("my_js_namespace", my_js_namespace);

//   const res = await pyodide.runPythonAsync(code);
//   console.log("Length of read: " + window.y);
//   console.log("First array elem: " + window.z);
//   return res;
// }


export const Search = () => {
  const [search, setSearch] = useState("");
  const [movieId, setMovieId] = useState("");
  const [blah, setBlah] = useState("");
  const { updateMovies } = useContext(MoviesContext);

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (search) {
      console.log("Searching query " + search);
      searchMovies(search).then((movies) => {
        updateMovies(movies);
      });
    }
  };

  const handleOnSubmitMovieId = (event: React.FormEvent) => {
    event.preventDefault();
    if (movieId) {
      console.log("Handling movieId " + movieId);
      getMovie(movieId).then((movies) => {
        updateMovies(movies);
      });
    }
  };

  const handleOnSubmitPreloaded = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Handling preloaded");
    loadMovies().then((movies) => {
      console.log("Got back " + movies.length + " movie items");
      updateMovies(movies);
    });
  };

  return (
    <div>
      <form name="form" onSubmit={(e) => handleOnSubmit(e)} noValidate>
        <input
          type="text"
          name="movie"
          className="search__input"
          placeholder="Search movie ... "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <form name="form" onSubmit={(e) => handleOnSubmitMovieId(e)} noValidate>
        <input
          type="text"
          name="movie"
          className="search__input"
          placeholder="Movie id ... "
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
        />
      </form>
      <form name="form" onSubmit={(e) => handleOnSubmitPreloaded(e)} noValidate>
        <input
          type="text"
          name="movie"
          className="search__input"
          placeholder="Preloaded ... "
          value={blah}
          onChange={(e) => setBlah(e.target.value)}
        />
      </form>
    </div>
  );
};
