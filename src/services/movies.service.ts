const movieApiBaseUrl = "https://api.themoviedb.org/3";
const posterBaseUrl = "https://image.tmdb.org/t/p/w300";

export function getFavorites(): Promise<Movie[]> {
  // My favorites: MOMMY, THE END OF EVANGELION, 2001, HOTARU NO HAKA
  return fetch(`favorites.json`,
               { method: 'get',
                 headers: {
                   'content-type': 'text/csv;charset=UTF-8',
                 }})
    .then((res) => res.json())
    .then((response) =>
      response.items.map((movie) =>
      {
        const {
          watched,
          title,
          year,
          runtime,
          rating,
          tags,
          lbFilm,
          lbDiary,
          id,
          poster,
          backdrop,
          directors
        } = movie;

        // console.log("Json entry's watched: " + watched + "; tags: " + tags);
        var returnMovie : Movie = {
          id,
          year,
          title,
          watched,
          rating,
          runtime,
          tags,
          picture: poster? `${posterBaseUrl}${poster}` : undefined,
          lbDiaryLink: lbDiary,
          lbFilmLink: lbFilm,
          directors
        };
        return returnMovie;
      }
      ));

  ///////to get from IDs and TMDB, could do:
  //
  // let res = ["265177", "18491", "62", "12477"];
  // return Promise.all(
  //   res.map((movieId) => getMovie(movieId).then((out) => out[0]))
  // );
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
      year : new Date(release_date).getFullYear().toString(),
      title,
      rating: undefined,
      runtime,
      picture: poster_path ? `${posterBaseUrl}${poster_path}` : undefined,
      lbDiaryLink: undefined,
      lbFilmLink: undefined,
    }];
}

function getPicture (movie : Movie) : Promise<Movie> {
  return getMovie(movie.id).then((movies) => {
    var newMovie = movie;
    newMovie.picture = movies[0].picture;
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
      lbFilm,
      id
    } = movie;

    return {
      id,
      year,
      title,
      watched,
      rating,
      runtime,
      picture: undefined,
      lbDiaryLink: undefined,
      lbFilmLink: lbFilm,
    };
  });
}

function filterStatic(movie : any, title : RegExp, year: string, date: string,
                      runtime: string, director: RegExp, writer : RegExp,
                      actor: RegExp, genre: RegExp)
: Boolean
{
  // console.log("some director match?", movie.directors.some((directorName) => director.test(directorName)))
  if (!title.test(movie.title)
      || (movie.directors.length > 0
          && !movie.directors.some((dirName) => director.test(dirName)))
      || (movie.writers.length > 0
          && !movie.writers.some((writerInfo) => writer.test(writerInfo.name)))
      || (movie.actors.length > 0
          && !movie.actors.some((actorInfo) => actor.test(actorInfo.name)))
      || (movie.genres.length > 0
          && !movie.genres.some((genreName) => genre.test(genreName)))
     )
  {
    return false;
  }

  return true;
}

function filterMovie(movie : any, title: RegExp, year: string, date: string,
                         rating: string, runtime: string, tags : RegExp,
                         director: RegExp, writer : RegExp, actor: RegExp,
                         genre: RegExp, src : string):
Movie[] {
  console.log("Filtering ", movie.title, movie.year, "; status ", movie.status)
  var result : Movie[] = [];
  if (src == "watchlist")
  {
    if (movie.status > 0)
    {
      return [];
    }
    if (!filterStatic(movie, title, year, date, runtime, director, writer, actor,
                      genre))
    {
      return [];
    }
    // TODO
    return result;
  }
  if (movie.status === 0)
  {
    return result;
  }
  if (!filterStatic(movie, title, year, date, runtime, director, writer, actor,
                    genre))
  {
    return [];
  }
  // get latest diary entry to have the rating and watched date, if any
  if (src == "watched")
  {
    var watchedInfo = "";
    var ratingInfo = "";
    var ratingNum = 0;
    var tagsInfo : string[] = [];
    if (movie.diary.length > 0)
    {
      watchedInfo = movie.diary[movie.diary.length - 1].date;
      ratingInfo = movie.diary[movie.diary.length - 1].rating.str;
      ratingNum = movie.diary[movie.diary.length - 1].rating.num;
      tagsInfo = movie.diary[movie.diary.length - 1].tags;
    }
    return [
      {
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        watched : watchedInfo,
        rating : ratingInfo,
        ratingNum : ratingNum,
        runtime : movie.runtime,
        tags : tagsInfo,
        picture: `${posterBaseUrl}${movie.posterPath}`,
        lbDiaryLink: "",
        lbFilmLink: movie.libURL,
        directors : movie.directors
      }
    ];
  }
  // for each diary entry, create a new movie
  if (movie.diary.length == 0)
  {
    return [
      {
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        watched : "",
        rating : "",
        ratingNum : 0,
        runtime : movie.runtime,
        tags : [],
        picture: `${posterBaseUrl}${movie.posterPath}`,
        lbDiaryLink: "",
        lbFilmLink: movie.libURL,
        directors : movie.directors
      }
    ];
  }
  console.log("Got into diaries")
  movie.diary.map((entry) => {
    result.push(
      {
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        watched : entry.date,
        rating : entry.rating.str,
        ratingNum : entry.rating.num,
        runtime : movie.runtime,
        tags : entry.tags,
        picture: `${posterBaseUrl}${movie.posterPath}`,
        lbDiaryLink: entry.entryURL,
        lbFilmLink: movie.libURL,
        directors : movie.directors
      }
    )
  });
  return result;
}

function filterMovies(master : any, title: string, year: string, date: string,
                         rating: string, runtime: string, tags : string,
                         director: string, writer : string, actor: string,
                         genre: string, sorting: string,
                         src : string):
Promise<Movie[]> {
  console.log("Now process with src ", src);
  var movies : Movie[] = [];
  // create regex ignoring case
  var titleRegex = new RegExp(title != "" ? title : /.*/, 'i');
  var tagsRegex = new RegExp(tags != "" ? tags : /.*/, 'i');
  var directorRegex = new RegExp(director != "" ? director : /.*/, 'i');
  var writerRegex = new RegExp(writer != "" ? writer : /.*/, 'i');
  var actorRegex = new RegExp(actor != "" ? actor : /.*/, 'i');
  var genreRegex = new RegExp(genre != "" ? genre : /.*/, 'i');

  console.log("Testing with title regex ", titleRegex)
  console.log("Testing with director regex ", directorRegex)
  master.movies.map((movie) => {
    movies = movies.concat(filterMovie(movie, titleRegex, year, date,
                                       rating, runtime, tagsRegex, directorRegex,
                                       writerRegex, actorRegex, genreRegex, src));
  });
  // TODO sorting
  return Promise.all(movies).then((movies) => movies);
}


export function getMovies(title: string, year: string, date: string,
                          rating: string, runtime: string, tags : string,
                          director: string,
                          writer: string, actor: string, genre: string,
                          sorting: string, src : string
                         ):
Promise<Movie[]> {
  return fetch(
    `master.json`,
    { method: 'get',
      headers: {
        'content-type': 'text/csv;charset=UTF-8',
      }})
    .then((res) => res.json())
    .then((master) => filterMovies(master, title, year, date,
                                   rating, runtime, tags, director, writer,
                                   actor, genre, sorting, src))
    .then((movies) => {
      // let res = Array.from(tmp);
      return Promise.all(movies.map((movie) => {
        if (movie.picture)
        {
          return movie;
        }
        return getPicture(movie);
      }))
        .then((results) => results);
    });
}

export interface Movie {
  id: number;
  watched?: string
  year?: string;
  title: string;
  runtime?: number;
  rating?: string;
  ratingNum?: number;
  tags?: string[];
  picture?: string;
  lbDiaryLink?: string;
  lbFilmLink?: string;
  directors?: string[];
}
