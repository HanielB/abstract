const movieApiBaseUrl = "https://api.themoviedb.org/3";
const posterBaseUrl = "https://image.tmdb.org/t/p/w300";

export function discoverMovies(): Promise<Movie[]> {
  return fetch(
    `${movieApiBaseUrl}/discover/movie?sort_by=popularity.desc&api_key=${process.env.REACT_APP_API_KEY}`
  )
    .then((res) => res.json())
    .then((response) => mapResults(response.results))
    .catch((_) => {
      return [];
    });
}

export function searchMovies(search: string): Promise<Movie[]> {
  return fetch(
    `${movieApiBaseUrl}/search/movie?query=${search}&api_key=${process.env.REACT_APP_API_KEY}`
  )
    .then((res) => res.json())
    .then((response) => mapResults(response.results))
    .catch((_) => {
      return [];
    });
}

function mapResults(res: any[]): Movie[] {
  return res.map((movie) => {
    const {
      id,
      title,
      poster_path,
      release_date,
    } = movie;

    return {
      id,
      year : undefined,
      title,
      release_date: release_date,
      rating: undefined,
      runtime: undefined,
      picture: poster_path ? `${posterBaseUrl}${poster_path}` : undefined,
      lbDiaryEntry: undefined,
      lbFilmLink: undefined,
    };
  });
}

export function getMovie(id: any): Promise<Movie[]> {
  return fetch(
    `${movieApiBaseUrl}/movie/${id}?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`
  )
    .then((res) => res.json())
    .then((response) => mapResult(response))
    .catch((_) => {
      return [];
    });
}

function mapResult(res: any): Movie[] {
    const {
      id,
      title,
      vote_average,
      poster_path,
      release_date,
      runtime,
    } = res;

    return [{
      id,
      year : undefined,
      title,
      release_date: release_date,
      rating: undefined,
      runtime,
      picture: poster_path ? `${posterBaseUrl}${poster_path}` : undefined,
      lbDiaryEntry: undefined,
      lbFilmLink: undefined,
    }];
}

function getPicture (movie : Movie) : Promise<Movie> {
  console.log("Get picture of " + movie.title + " with id " + movie.id);
  return getMovie(movie.id).then((movies) => {
    console.log("\tFrom " + movies.length + " movies getting pic " + movies[0].picture);
    const newMovie = movies[0];
    newMovie.year = movie.year;
    newMovie.runtime = movie.runtime;
    newMovie.rating = movie.rating;
    return newMovie;
  });
}

export function loadMovies(): Promise<Movie[]> {
  return fetch(
    `test1.json`
  )
    .then((res) => res.json())
    .then((response) => mapLoaded(response.items))
  // Using "Promise.all" to convert the vector of promises resulting
  // from the map into a promise of a vector, which is the expected
  // type.
  //
  // I don't actually need this once I improve my local data base to
  // store the poster link, but this sort of chaining of fetchs will
  // be necessary anyway when I integrate JW.
    .then((movies) => Promise.all(
      movies.map((movie) => getPicture(movie))).then((results) => results))
    .catch((_) => {
      return [];
    });
}

function mapLoaded(res: any[]): Movie[] {
  return res.map((movie) => {
    const {
      watched,
      title,
      year,
      runtime,
      rating,
      lbLink,
      id
    } = movie;

    return {
      id,
      year,
      title,
      release_date: watched,
      rating,
      runtime,
      picture: undefined,
      lbDiaryEntry: undefined,
      lbFilmLink: lbLink,
    };
  });
}

export interface Movie {
  id: number;
  year?: string;
  title: string;
  release_date: string;
  rating?: number;
  runtime?: number;
  picture?: string;
  lbDiaryEntry?: string;
  lbFilmLink?: string;
}
