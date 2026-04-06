import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  master: Object[];
  movies: Movie[];
  start: boolean;
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
  setSearchWatched : Function;
  setSearchRating : Function;
  setSearchTags : Function;
  setSearchTitle : Function;
  setSearchYear : Function;
  setSearchRuntime : Function;
  setSearchDirector : Function;
  setSearchWriter : Function;
  setSearchActor : Function;
  setSearchGenre : Function;
  setSearchCountry : Function;
  setSearchStudio : Function;
  setSearchSingleton : Function;
  setSearchWatchlist : Function;
  setSearchAvailable : Function;
  setSearchSorting : Function;
  setSearchRewatch : Function;
  posterOnly : boolean;
  setPosterOnly : Function;
  cardsPerRow : number;
  setCardsPerRow : Function;
  setStart : Function;
  setLoading : Function;
  setSelected : Function;
  setListName : Function;
  showLists : boolean;
  setShowLists : Function;
  listMaster : any;
}>({
  master: [],
  movies: [],
  start : false,
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
  setSearchWatched : Function,
  setSearchRating : Function,
  setSearchTags : Function,
  setSearchTitle : Function,
  setSearchYear : Function,
  setSearchRuntime : Function,
  setSearchDirector : Function,
  setSearchWriter : Function,
  setSearchActor : Function,
  setSearchGenre : Function,
  setSearchCountry : Function,
  setSearchStudio : Function,
  setSearchSingleton : Function,
  setSearchWatchlist : Function,
  setSearchAvailable : Function,
  setSearchSorting : Function,
  setSearchRewatch : Function,
  posterOnly : false,
  setPosterOnly : Function,
  cardsPerRow : 4,
  setCardsPerRow : Function,
  setStart : Function,
  setLoading : Function,
  setSelected : Function,
  setListName : Function,
  showLists : false,
  setShowLists : Function,
  listMaster : null
});
