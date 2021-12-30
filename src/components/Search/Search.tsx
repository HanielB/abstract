import React, { useState, useContext } from "react";
import "./Search.css";

import { searchMovies, getMovie, loadMovies } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";

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
