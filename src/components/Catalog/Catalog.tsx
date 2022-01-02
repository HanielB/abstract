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
            <img src={movie.picture || imgPlaceholder} alt={movie.title} />
            <div className="catalog__item__resume">{movie.runtime}</div>
          </div>
          <div className="catalog__item__footer">
            <div className="catalog__item__footer__name">
              {movie.title} ({new Date(movie.release_date).getFullYear()})
            </div>
            <div className="catalog__item__footer__rating">{movie.rating}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
