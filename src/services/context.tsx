import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  master: Object[];
  movies: Movie[];
  selected: number[];
  updateMovies: Function;
  loading : boolean;
  listName : string;
  setLoading : Function;
  setSelected : Function;
}>({
  master: [],
  movies: [],
  selected: [],
  updateMovies: Function,
  loading : false,
  listName : "",
  setLoading : Function,
  setSelected : Function
});
