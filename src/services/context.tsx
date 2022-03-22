import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  master: Object[];
  movies: Movie[];
  updateMovies: Function;
  loading : boolean;
  setLoading : Function;
}>({
  master: [],
  movies: [],
  updateMovies: Function,
  loading : false,
  setLoading : Function
});
