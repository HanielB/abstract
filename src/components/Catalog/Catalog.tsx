import React, { useContext } from "react";
import "./Catalog.css";
import imgPlaceholder from "./movie_placeholder.png";
import rewatchImg from "./two-circular-arrows.png";
import watchlistImg from "./not-watched.png";
import { MoviesContext } from "../../services/context";
import { getMovies } from "../../services/movies.service";


export const Catalog = () => {
  const { master, movies, loading,
          setLoading, updateMovies } = useContext(MoviesContext);

  const getId = (id: number, watched?: string) => {
    if (!watched)
    {
      return id;
    }
    const split = watched.split("-")
    const yearMovie = Number(split[0])
    const monthMovie = Number(split[1])
    const dayMovie = Number(split[2])

    return id + yearMovie + monthMovie + dayMovie;
  }

  const getDirected = (director: string) => {
    setLoading(true);
    getMovies(master, "", "", "", "", "", "",
              director, "", "", "",
              "year", true, true, true, true)
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getTag = (tag: string) => {
    setLoading(true);
    getMovies(master, "", "", "", "", "", tag,
              "", "", "", "",
              "watched", false, false, true, true)
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getIcon = (prov : string) => {
    if (prov == "nfx") return "https://a.ltrbxd.com/sm/upload/za/bp/jc/zn/netflix-small.png";
    if (prov == "prv") return "https://images.justwatch.com/icon/52449861/s100"
    if (prov == "hbm") return "https://images.justwatch.com/icon/182948653/s100"
    if (prov == "gop") return "https://images.justwatch.com/icon/136871678/s100"
    if (prov == "mbi") return "https://a.ltrbxd.com/sm/upload/0t/1m/aa/u9/mubi.png?k=371edba60c"
    if (prov == "ply") return "https://a.ltrbxd.com/sm/upload/o0/8s/mp/ej/google-small.png?k=c07a6d2d92"
    if (prov == "dnp") return "https://images.justwatch.com/icon/147638351/s100"
    return "https://images.justwatch.com/icon/250272035/s100"
  }

  if (loading) {
    return (<div>
              <h1>LOADING</h1>
            </div>);
  }
  return (
    <div className="catalogContainer">
      {movies.map((movie) => (
        <div className="catalog__item" key={getId(movie.id, movie.watched)}>
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
                <a href={movie.lbDiaryLink}>{
                  movie.watched && movie.watched.split("-").length > 3?
                    movie.watched.substring(0, 10) : movie.watched
                }</a>
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
                    <span className="tag"
                          onClick={(e) => getTag(tag)}>
                      {tag}
                    </span>
                  )) : <span></span>
              }
            </div>
            <div className="directors">
              {
                (movie.directors)?
                  movie.directors.map((director) => (
                    <span className="director"
                          onClick={(e) => getDirected(director)}>
                      {director}
                    </span>
                  )) : <span></span>
              }
            </div>
            <div className="available">
              {
                (movie.available)?
                  movie.available.map((prov) => (
                  <span>
                    <img className="provider" src={getIcon(prov)}
                    />
                  </span>
                  ))
                : <span></span>
              }
          </div>
            <div className="runtimeRewatch">
              <span className="runtime">
                {movie.runtime}min
              </span>
              {
                (movie.rewatch)?
                  <span className="rewatch">
                    <img src={rewatchImg}
                    />
                  </span>
                : (movie.watchlist)?
                  <span className="rewatch">
                    <img src={watchlistImg}
                    />
                  </span>
                : <span></span>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
