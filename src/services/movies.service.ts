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

export function getMovie(id: string): Promise<Movie[]> {
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

export function loadMovies(): Promise<Movie[]> {
  return fetch(
    `test1.json`
  )
    .then((res) => res.json())
    .then((response) => mapLoaded(response.items))
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
