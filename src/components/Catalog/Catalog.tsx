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
            <div className="catalog__item__resume">
              <p>Watched: {movie.watched}<br />
              Runtime: {movie.runtime}<br />
              Tags: {movie.tags}</p>
            </div>
          </div>
          <div className="catalog__item__footer">
            <div className="catalog__item__footer__name">
            <a href={movie.lbFilmLink}>
              {movie.title} ({movie.year})
              </a>
            </div>
            <div className="catalog__item__footer__rating">{movie.rating}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
