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

function filterDiary(entry : any, date: Date[], rating: number[], tags : RegExp)
: Boolean
{
  const yearEntry = Number(entry.date.split("-")[0])
  const monthEntry = Number(entry.date.split("-")[1])-1
  const dayEntry = Number(entry.date.split("-")[2])

  const entryDate = new Date(yearEntry, monthEntry, dayEntry)
  if (date.length > 0 && (entryDate < date[0] || entryDate > date[1]))
  {
    return false;
  }
  if (rating.length > 0 &&
      (entry.rating.num < rating[0] || entry.rating.num > rating[1]))
  {
    return false;
  }
  if (String(new RegExp(/.*/,'i')) != String(tags)
      && !entry.tags.some((tag) => tags.test(tag)))
  {
    return false;
  }
  return true;
}

function filterStatic(movie : any, title : RegExp, year: number[],
                      runtime: number[], director: RegExp, writer : RegExp,
                      actor: RegExp, genre: RegExp)
: Boolean
{
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
  if (year.length > 0 && movie.year < year[0] || movie.year > year[1])
  {
    return false;
  }
  if (runtime.length > 0 && movie.runtime < runtime[0] || movie.runtime > runtime[1])
  {
    return false;
  }
  return true;
}

function filterMovie(movie : any, title: RegExp, year: number[], date: Date[],
                         rating: number[], runtime: number[], tags : RegExp,
                         director: RegExp, writer : RegExp, actor: RegExp,
                         genre: RegExp, src : string):
Movie[] {
  var result : Movie[] = [];
  if (src == "watchlist")
  {
    if (movie.status > 0
        || !filterStatic(movie, title, year, runtime, director, writer,
                         actor, genre))
    {
      return [];
    }
    return [
      {
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        runtime : movie.runtime,
        ratingNum: 0,
        picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
        lbFilmLink: movie.lbURL,
        directors : movie.directors
      }
    ];
  }
  if (movie.status === 0
      || !filterStatic(movie, title, year, runtime, director, writer, actor,
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
        picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
        lbDiaryLink: "",
        lbFilmLink: movie.lbURL,
        directors : movie.directors
      }
    ];
  }
  if (movie.diary.length == 0)
  {
    // if asked for rating or date, ignore
    if (date.length > 0 || rating.length > 0 || String(new RegExp(/.*/,'i')) != String(tags))
    {
      return [];
    }
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
        picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
        lbDiaryLink: "",
        lbFilmLink: movie.lbURL,
        directors : movie.directors
      }
    ];
  }
  // for each diary entry, create a new movie if it fits criteria
  movie.diary.map((entry) => {
    if (filterDiary(entry, date, rating, tags))
    {
      result.push({
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        watched : entry.date,
        rating : entry.rating.str,
        ratingNum : entry.rating.num,
        runtime : movie.runtime,
        tags : entry.tags,
        picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
        lbDiaryLink: entry.entryURL,
        lbFilmLink: movie.lbURL,
        directors : movie.directors
      })
    }
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
  const titleRegex = new RegExp(title != "" ? title : /.*/, 'i');
  const tagsRegex = new RegExp(tags != "" ? tags : /.*/, 'i');
  const directorRegex = new RegExp(director != "" ? director : /.*/, 'i');
  const writerRegex = new RegExp(writer != "" ? writer : /.*/, 'i');
  const actorRegex = new RegExp(actor != "" ? actor : /.*/, 'i');
  const genreRegex = new RegExp(genre != "" ? genre : /.*/, 'i');

  // year is "y1[..][y2]". If there isn't ".." then we will set upper
  // bound as y1, otherwise it's y2 if given, otherwise it's current
  // year
  var years : number[] = year === "" ? [] : year.split("..").map(
    (year) => Number(year != "" ? year : new Date().getFullYear()))
  if (years.length === 1)
  {
    years.push(years[0])
  }

  var runtimes : number[] = runtime === "" ? [] : runtime.split("..").map(
    (runtime) => runtime != "" ? Number(runtime) : 10000)
  if (runtimes.length === 1)
  {
    runtimes.push(runtimes[0])
  }

  var ratings : number[] = rating === "" ? [] : rating.split("..").map(
    (rating) => rating != "" ? Number(rating) : 10)
  if (ratings.length === 1)
  {
    ratings.push(ratings[0])
  }
  var dates : Date[] = [];
  if (date != "" )
  {
    const split = date.split("..")
    // first four digits are year
    var dateYear = Number(split[0].substring(0, 4))
    // if no month is given, get first (by index, which is 0). Otherwise next
    // two digits, subtracted by one since index
    var dateMonth =
        split[0].length === 4 ? 0 : Number(split[0].substring(4, 6)) - 1;
    // if no day, get first day. Otherwise last two digits
    var dateDay = split[0].length <= 6? 1 : Number(split[0].substring(6, 8))
    dates.push(new Date(dateYear, dateMonth, dateDay));
    // no end given then go until end of given year/month/day
    if (split.length === 1)
    {
      // to get last day of year, in case only year given, go to last month
      // index + 1 (12) and day 0, which makes it go back one day.
      //
      // If month was given but no day, we also go a month up and will use day 0
      // to go back.
      //
      // If day was given we use same year, month and day
      dates.push(new Date(dateYear,
                          split[0].length === 4 ? 12 :
                          dateMonth + (split[0].length <= 6 ? 1 : 0),
                          split[0].length <= 6 ? 0 : dateDay
                         ));
    }
    // implicity end of interval is today
    else if (split[1] === "")
    {
      dates.push(new Date())
    }
    else
    {
      // if only year is given, we go to last day similarly to above. Same for
      // only month being given, so we go to last day of month
      dateYear = Number(split[1].substring(0, 4))
      dateMonth =
        split[1].length === 4 ? 12 :
        Number(split[1].substring(4, 6)) - (split[1].length <= 6 ? 0 : 1);
      dateDay = split[1].length <= 6? 0 : Number(split[1].substring(6, 8))
      dates.push(new Date(dateYear, dateMonth, dateDay));
    }
  }

  console.log("years:", years)
  console.log("runtimes:", runtimes)
  console.log("ratings:", ratings)
  console.log("dates:", dates.map((date) => date.toString()))

  master.movies.map((movie) => {
    movies = movies.concat(filterMovie(movie, titleRegex, years, dates,
                                       ratings, runtimes, tagsRegex, directorRegex,
                                       writerRegex, actorRegex, genreRegex, src));
  });
  // TODO sorting
  console.log("sorting:", sorting)
  if (sorting == "watched")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.watched || movie1.watched.length === 0)
      {
        console.log(movie1.title, "no date, go back")
        return 1;
      }
      if (!movie2.watched || movie2.watched.length === 0)
      {
        console.log(movie2.title, "no date, maintain")
        return 0;
      }
      var year = Number(movie1.watched.split("-")[0]);
      var month = Number(movie1.watched.split("-")[1]) - 1;
      var day = Number(movie1.watched.split("-")[2]);
      const date1 = new Date(year, month, day);
      year = Number(movie2.watched.split("-")[0]);
      month = Number(movie2.watched.split("-")[1]) - 1;
      day = Number(movie2.watched.split("-")[2]);
      const date2 = new Date(year, month, day);
      // console.log("Got", date2 > date1, Number(date2 > date1), "from comparing",movie2.title,movie1.title)
      return date2 > date1 ? 1 : -1;
    })
  }
  else if (sorting == "year")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.year)
      {
        return 1;
      }
      if (!movie2.year)
      {
        return 0;
      }
      return Number(movie2.year) - Number(movie1.year)
    })
  }
  else if (sorting == "rating")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.ratingNum)
      {
        return 1;
      }
      if (!movie2.ratingNum)
      {
        return 0;
      }
      return movie2.ratingNum - movie1.ratingNum
    })
  }
  else if (sorting == "runtime")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.runtime)
      {
        return 1;
      }
      if (!movie2.runtime)
      {
        return 0;
      }
      return movie2.runtime - movie1.runtime
    })
  }
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
