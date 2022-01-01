import React, { useState, useEffect } from "react";
import "./App.css";
import { Header } from "./components/Header/Header";
import { Catalog } from "./components/Catalog/Catalog";
import { Movie, discoverMovies } from "./services/movies.service";
import { MoviesContext } from "./services/context";

// import script from './python/main.py';

// const runScript = async (code : any) => {
//   const pyodide = await window.loadPyodide({
//     indexURL : "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
//   });
//   return await pyodide.runPythonAsync(code);
// }

// function Pyodide() {
//   return (
//     <Header>
//       <script src=
//       {'https://cdn.jsdelivr.net/pyodide/dev/full/pyodide.js'} />
//     </Header>
//   )
// }

function App() {
  useEffect(() => {
    discoverMovies()
      .then(setMovies)
      .catch((_) => setMovies([]));

    // const scriptText = await (await fetch(script)).text();
    // const out = await runScript(scriptText);
    // console.log("Python result: " + out)
  }, []);

  const [movies, setMovies] = useState<Movie[]>([]);

  return (
    <MoviesContext.Provider value={{ movies, updateMovies: setMovies }}>
      <div className="App">
        <Header></Header>
        <Catalog></Catalog>
      </div>
    </MoviesContext.Provider>
  );
}

export default App;
