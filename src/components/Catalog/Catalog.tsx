import React, { useContext } from "react";
import "./Catalog.css";
import imgPlaceholder from "./movie_placeholder.png";
import { MoviesContext } from "../../services/context";


export const Catalog = () => {
  const { movies, loading } = useContext(MoviesContext);

  if (loading) {
    return (<div>
              <h1>LOADING</h1>
            </div>);
  }
  return (
    <div className="catalogContainer">
      {movies.map((movie) => (
        <div className="catalog__item" key={movie.id}>
          <div className="catalog__item__img">
              <img src={movie.picture || imgPlaceholder} alt={movie.title}
              />
          </div>
          <div className="catalog__item__info">
            <span>
              {movie.title}
            </span>
            <span>
              ({movie.year})
            </span>
            <span>
              {movie.watched}
            </span>
            <span>
              {movie.rating}
            </span>
            <span className="tags">
              {movie.tags}
            </span>
            <span>
              {movie.director}
            </span>
            <span>
              {movie.runtime}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
