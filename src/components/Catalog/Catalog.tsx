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
            <div className="titleYear">
              <span className="title">
            <a href={movie.lbFilmLink}>
              {movie.title}
            </a>
              </span>
              <span className="year">
                ({movie.year})
              </span>
            </div>
            <div className="watchedRating">
              <span className="watched">
                <a href={movie.lbDiaryLink}>{movie.watched}</a>
              </span>
              {
                <span className={(movie.rating)? "rating" : "year"}>
                {movie.rating}
              </span>
              }
            </div>
            <div className="tags">
              {
                (movie.tags)?
                  movie.tags.map((tag) => (
                    <span className="tag">
                      {tag}
                    </span>
                  )) : <span></span>
              }
            </div>
            <div className="directors">
              {
                (movie.directors)?
                  movie.directors.map((director) => (
                    <span className="director">
                      {director}
                    </span>
                  )) : <span></span>
              }
            </div>
            <span className="runtime">
              {movie.runtime}min
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
