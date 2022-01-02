import React from "react";
import { Movie } from "./movies.service";

export const MoviesContext = React.createContext<{
  movies: Movie[];
  updateMovies: Function;
  loading : boolean;
  setLoading : Function;
}>({
  movies: [],
  updateMovies: Function,
  loading : false,
  setLoading : Function
});
