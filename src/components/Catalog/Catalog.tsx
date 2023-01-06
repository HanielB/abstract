import React, { useContext, useReducer } from "react";
import "./Catalog.css";
import imgPlaceholder from "./movie_placeholder.png";
import viewsImg from "./watched.png";
import rewatchImg from "./two-circular-arrows.png";
import watchlistImg from "./not-watched.png";
import downloadImg from "./download.png";
import { MoviesContext } from "../../services/context";
import { Movie, getMovies } from "../../services/movies.service";


export const Catalog = () => {
  const { master, movies, loading, selected,
          setLoading, updateMovies, setSelected, setListName } = useContext(MoviesContext);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  // remove all selected cards
  const handleRemoval = () => {
    if (selected.length === 0)
      return;
    var newMovies : Movie[] = [];
    movies.map((movie) => {
      if (!selected.includes(movie.id))
      {
        newMovies.push(movie);
      }
    });
    setSelected([]);
    updateMovies(newMovies);
  }

  // move given card "move" positions
  const handleMove = (id: number, move: number) => {
    var foundIndex = -1;
    var newIndex = -1;
    for (let i = 0; i < movies.length; i++)
    {
      if (movies[i].id === id)
      {
        foundIndex = i;
        newIndex = Math.min(Math.max(0, i + move), movies.length);
      }
    }
    var newMovies : Movie[] = [];
    // going left
    if (move < 0)
    {
      // get movies up to new index
      newMovies = movies.slice(0, newIndex);
      // put at new index
      newMovies.push(movies[foundIndex]);
      // put everybody between that index and the original index of the moved guy
      newMovies.push(...movies.slice(newIndex, foundIndex));
      // put everybody after original index
      newMovies.push(...movies.slice(foundIndex + 1))
    }
    // going right
    else
    {
      // get movies up to original index
      newMovies = movies.slice(0, foundIndex);
      // get everybody after original index and up to new index (inclusive)
      newMovies.push(...movies.slice(foundIndex + 1, newIndex + 1));
      // put at new index
      newMovies.push(movies[foundIndex]);
      // put everybody after new index
      newMovies.push(...movies.slice(newIndex + 1))
    }
    updateMovies(newMovies);
  }

  const handleCardCtrlClick = (id: number) => {
    if (selected.includes(id))
    {
      // make selected as old one minus the given id
      setSelected(selected.filter(e => e !== id));
      return;
    }
    selected.push(id);
    forceUpdate();
  }

  const handleCardShiftClick = (id: number) => {
    var foundIndex = -1;
    var firstIndex = -1;
    for (let i = 0; i < movies.length; i++)
    {
      if (firstIndex === -1 && selected.includes(movies[i].id))
      {
        firstIndex = i;
        continue;
      }
      if (movies[i].id === id)
        foundIndex = i;
    }
    // if only selecting, set this guy as selected, in case it is not
    if (firstIndex === -1)
    {
      if (!selected.includes(id))
      {
        selected.push(id);
        forceUpdate();
      }
      return;
    }
    // select everybody from first index to found index
    selected.push(...movies.slice(firstIndex + 1,
                                  foundIndex + 1).map((movie) => movie.id));
    forceUpdate();
  }

  const getDirected = (director: string) => {
    setLoading(true);
    getMovies(master, "", "", "", "", "", "",
              director, "", "", "", "", "",
              "year", true, true, "", true)
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getTag = (tag: string) => {
    setLoading(true);
    setListName("");
    getMovies(master, "", "", "", "", "", tag,
              "", "", "", "", "", "",
              "watched", false, false, "", true)
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getIcon = (prov : string) => {
    if (prov === "Netflix") return "https://a.ltrbxd.com/sm/upload/za/bp/jc/zn/netflix-small.png";
    if (prov === "Amazon Prime Video") return "https://images.justwatch.com/icon/52449861/s100"
    if (prov === "HBO Max") return "https://images.justwatch.com/icon/182948653/s100"
    if (prov === "Globo Play") return "https://images.justwatch.com/icon/136871678/s100"
    if (prov === "Mubi") return "https://a.ltrbxd.com/sm/upload/0t/1m/aa/u9/mubi.png?k=371edba60c"
    if (prov === "Google Play Movies") return "https://a.ltrbxd.com/sm/upload/o0/8s/mp/ej/google-small.png?k=c07a6d2d92"
    if (prov === "Disney Plus") return "https://images.justwatch.com/icon/147638351/s100"
    if (prov === "Criterion Channel") return "https://a.ltrbxd.com/sm/upload/j6/4v/o4/ru/criterionchannel-small.png?k=d168bd1a60"
    if (prov === "Star Plus") return "https://images.justwatch.com/icon/250272035/s100"
    if (prov === "local") return downloadImg;
    return imgPlaceholder;
  }

  if (loading) {
    return (<div>
              <h1>LOADING</h1>
            </div>);
  }
  return (
    <div className="catalogContainer" id="catalog">
      {movies.map((movie) => (
        <div className={"catalog__item" + (selected.includes(movie.id) ? "__selected" : "")}
             tabIndex={0}
             key={movie.id}
             onClick={(e) => {
               if (e.ctrlKey)
                 handleCardCtrlClick(movie.id);
               else if (e.shiftKey)
                 handleCardShiftClick(movie.id);
             }}
             onKeyDown={(e) => {
               // if backspace or delete is pressed
               if (e.keyCode === 8 || e.keyCode === 46) {
                 handleRemoval();
               }
               // left arrow  37, up arrow  38, right arrow 39, down arrow  40
               else if (e.keyCode === 37)
               {
                 handleMove(movie.id, -1);
               }
               else if (e.keyCode === 38)
               {
                 handleMove(movie.id, -4);
               }
               else if (e.keyCode === 39)
               {
                 handleMove(movie.id, 1);
               }
               else if (e.keyCode === 40)
               {
                 handleMove(movie.id, 4);
               }
               }}
        >
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
                (movie.views && (movie.views > 1 || movie.previousView))?
                  <span className="views">
                    <img src={viewsImg} className="watchedImg"
                    />
                    <span className="floatingNumber">
                      {movie.views}{movie.previousView? "+" : ""}
                    </span>
                  </span>
                : (movie.rewatch)?
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
