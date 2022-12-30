import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  master: Object[];
  movies: Movie[];
  selected: number[];
  updateMovies: Function;
  loading : boolean;
  setLoading : Function;
  setSelected : Function;
}>({
  master: [],
  movies: [],
  selected: [],
  updateMovies: Function,
  loading : false,
  setLoading : Function,
  setSelected : Function
});
