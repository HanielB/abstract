import React, { useState, useContext } from "react";
import "./Search.css";

import { searchMovies, getMovie } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";

export const Search = () => {
  const [search, setSearch] = useState("");
  const [movieId, setMovieId] = useState("");
  const { updateMovies } = useContext(MoviesContext);

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (search) {
      searchMovies(search).then((movies) => {
        updateMovies(movies);
      });
    }
  };

  const handleOnSubmitMovieId = (event: React.FormEvent) => {
    event.preventDefault();
    if (movieId) {
      getMovie(movieId).then((movies) => {
        updateMovies(movies);
      });
    }
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
    </div>
  );
};
