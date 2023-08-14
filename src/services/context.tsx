import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  master: Object[];
  movies: Movie[];
  selected: number[];
  updateMovies: Function;
  loading : boolean;
  listName : string;
  searchTitle    : string;
  searchYear     : string;
  searchRuntime  : string;
  searchWatched  : string;
  searchRating   : string;
  searchTags     : string;
  searchDirector : string;
  searchGenre    : string;
  searchCountry  : string;
  searchWriter   : string;
  searchActor    : string;
  searchStudio   : string;
  searchSingleton : string;
  searchWatchlist : string;
  searchAvailable : string;
  searchSorting : string;
  searchRewatch : string;
  setLoading : Function;
  setSelected : Function;
  setListName : Function;
}>({
  master: [],
  movies: [],
  selected: [],
  updateMovies: Function,
  loading : false,
  listName : "",
  searchTitle : "",
  searchYear : "",
  searchRuntime : "",
  searchWatched : "",
  searchRating : "",
  searchTags : "",
  searchDirector : "",
  searchGenre : "",
  searchCountry : "",
  searchWriter : "",
  searchActor : "",
  searchStudio : "",
  searchSingleton : "",
  searchWatchlist : "",
  searchAvailable : "",
  searchSorting : "",
  searchRewatch : "",
  setLoading : Function,
  setSelected : Function,
  setListName : Function
});
