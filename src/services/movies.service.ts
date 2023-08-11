const movieApiBaseUrl = "https://api.themoviedb.org/3";
const posterBaseUrl = "https://image.tmdb.org/t/p/w300";

// icons:
//  - netflix: https://a.ltrbxd.com/sm/upload/za/bp/jc/zn/netflix-small.png
//   - prime: https://images.justwatch.com/icon/52449861/s100
//   - star+: https://images.justwatch.com/icon/250272035/s100
//   - criterion: https://a.ltrbxd.com/sm/upload/j6/4v/o4/ru/criterionchannel-small.png?k=d168bd1a60
//   - gplay: https://a.ltrbxd.com/sm/upload/o0/8s/mp/ej/google-small.png?k=c07a6d2d92
//   - hbo: https://images.justwatch.com/icon/182948653/s100
//   - mubi: https://a.ltrbxd.com/sm/upload/0t/1m/aa/u9/mubi.png?k=371edba60c
//   - disney+: https://images.justwatch.com/icon/147638351/s100
//   - globo: https://images.justwatch.com/icon/136871678/s100

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

export function getId(id: number, watched?: string) : number {
  if (!watched)
  {
    return id;
  }
  const split = watched.split("-")
  const yearMovie = Number(split[0])
  const monthMovie = Number(split[1])
  const dayMovie = Number(split[2])

  return id + yearMovie + monthMovie + dayMovie;
}


export function convertMovie(movie: any): Movie {
  // movie is already in the internal format
  if (!movie.hasOwnProperty('status'))
  {
    return movie;
  }
  // convert
  return populateMovie(movie, [], [], [], "yes");
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
      tmdbId : id,
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
  return getMovie(movie.tmdbId).then((movies) => {
    var newMovie = movie;
    newMovie.picture = movies[0].picture;
    return newMovie;
  });
}

function addAvailable(providers: string[], candidateProvider : string, movie: Movie) : Movie {
  console.log("Test provider ", candidateProvider)
  if (!providers.includes(candidateProvider))
  {
    return movie;
  }
  if (!movie.available)
  {
    console.log("Added", candidateProvider)
    movie.available = [candidateProvider];
    return movie;
  }
  if (!movie.available.includes(candidateProvider))
  {
    console.log("Added", candidateProvider)
    movie.available.push(candidateProvider);
  }
  return movie;
}

async function getAvailable(movie : Movie, providers : string[]) : Promise<Movie> {
  // guard for movies without tmdb id
  if (movie.tmdbId < 0 || providers.length === 0)
  {
    return movie;
  }
  console.log("Test with ", providers);

  // console.log(`${movieApiBaseUrl}/movie/${movie.tmdbId}/watch/providers?api_key=${process.env.REACT_APP_API_KEY}`)
  const tmdbRequest = await fetch(`${movieApiBaseUrl}/movie/${movie.tmdbId}/watch/providers?api_key=${process.env.REACT_APP_API_KEY}`);

  // console.log("status of br request:", tmdbRequest.status);
  if (tmdbRequest.status !== 200)
  {
    return movie;
  }
  const dataJson = await tmdbRequest.json();
  if ("BR" in dataJson.results)
  {
    if ("buy" in dataJson.results["BR"])
    {
      dataJson.results["BR"].buy.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
    if ("rent" in dataJson.results["BR"])
    {
      dataJson.results["BR"].rent.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
    if ("flatrate" in dataJson.results["BR"])
    {
      // console.log("got here")
      dataJson.results["BR"].flatrate.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
  }
  if ("US" in dataJson.results)
  {
    if ("buy" in dataJson.results["US"])
    {
      dataJson.results["US"].buy.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
    if ("rent" in dataJson.results["US"])
    {
      dataJson.results["US"].rent.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
    if ("flatrate" in dataJson.results["US"])
    {
      dataJson.results["US"].flatrate.map((entry) => {
        movie = addAvailable(providers, entry.provider_name, movie);
      })
    }
  }
  if (movie.available && movie.available.length === 0)
  {
    movie.available = undefined;
  }
  // console.log("Available:", movie.available)
  return movie;
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
      tmdbId : id,
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

function getMovieDate(dateStr : string) : Date
{
  const split = dateStr.split("-")
  const yearMovie = Number(split[0])
  const monthMovie = Number(split[1])-1
  const dayMovie = Number(split[2])
  const hourMovie = split.length > 3? Number(split[3]) : 0;
  return new Date(yearMovie, monthMovie, dayMovie, hourMovie);
}

function filterDiary(watchedDate : string, movieRating : number,
                     movieTags : string[], movieRewatched : boolean,
                     date: Date[], rating: number[],
                     tags : RegExp[], rewatch: string)
: boolean
{
  if ((rewatch === "no" && movieRewatched) ||
      (rewatch === "only" && !movieRewatched))
  {
    return false;
  }
  if (date.length > 0)
  {
    if (watchedDate === "")
    {
      return false;
    }
    const movieDate = getMovieDate(watchedDate);
    if (movieDate < date[0] || movieDate > date[1])
    {
      return false;
    }
  }
  if (rating.length > 0
      && ((rating[0] === -1 && movieRating > 0)
          || (rating[0] !== -1
              && (movieRating < rating[0] || movieRating > rating[1]))))
  {
    return false;
  }
  if (tags.length > 0
      && !tags.every((tagRegex) => movieTags.some((tag) => tagRegex.test(tag))))
  {
    return false;
  }
  return true;
}

function isRegexAll(regex: RegExp)
{
  return regex.toString() === (new RegExp(/.*/, 'i')).toString();
}

function filterStatic(movie : any, title : RegExp, year: number[],
                      runtime: number[], director: RegExp, writer : RegExp,
                      actor: RegExp, genre: RegExp, country: RegExp, studio: RegExp,
                      collection = -1, collectionName : RegExp)
: boolean
{
  if (collection !== -1 && movie.collection.id !== collection)
  {
    return false;
  }
  if (!title.test(movie.title)
      || (!isRegexAll(director) &&
          (movie.directors.length === 0
           || !movie.directors.some((dirName) => director.test(dirName))))
      || (!isRegexAll(writer) &&
          (movie.writers.length === 0
           || !movie.writers.some((writerInfo) => writer.test(writerInfo.name))))
      || (!isRegexAll(actor) &&
          (movie.actors.length === 0
           || !movie.actors.some((actorInfo) => actor.test(actorInfo.name))))
      || (!isRegexAll(genre) &&
          (movie.genres.length === 0
           || !movie.genres.some((genreName) => genre.test(genreName))))
      || (!isRegexAll(country) &&
          (movie.countries.length === 0
           || !movie.countries.some((countryName) => country.test(countryName))))
      || (!isRegexAll(studio) &&
          (movie.studios.length === 0
           || !movie.studios.some((studioName) => studio.test(studioName))))
     )
  {
    return false;
  }
  if (year.length > 0 && (movie.year < year[0] || movie.year > year[1]))
  {
    return false;
  }
  if (runtime.length > 0 && (movie.runtime < runtime[0] || movie.runtime > runtime[1]))
  {
    return false;
  }
  if (!isRegexAll(collectionName) &&
      (!movie.collection.name || !collectionName.test(movie.collection.name)))
  {
    return false;
  }
  return true;
}

function populateMovie(movie : any, date: Date[], rating: number[],
                       tags : RegExp[], rewatch: string)
: Movie {
  var watchedInfo = "";
  var ratingInfo = "";
  var ratingNum = 0;
  var lbDiaryLink = "";
  var views = 0;
  var previousView = false;
  if (movie.diary.length > 0)
  {
    // filter out diary entries that are incompatible
    var entries : any[] = movie.diary.filter((entry) =>
      filterDiary(entry.date, entry.rating.num, entry.tags, entry.rewatch,
                  date, rating, tags, rewatch));
    views = entries.length;
    if (entries.length > 0)
    {
      watchedInfo = entries[entries.length - 1].date;
      ratingInfo = entries[entries.length - 1].rating.str;
      ratingNum = entries[entries.length - 1].rating.num;
      lbDiaryLink = entries[entries.length - 1].entryURL;
      // We only care about previous views when we are *not*
      // filtering by diary info, i.e., if date, rating and tags are
      // default values. In such a case, if first diary entry is a
      // rewatch, then this movie has previous views
      previousView = entries[0].rewatch &&
        date.length === 0 && rating.length === 0 && tags.length === 0;
    }
  }
  return {
    id : getId(movie.tmdbId, watchedInfo),
    tmdbId : movie.tmdbId,
    year : movie.year,
    title : movie.title,
    watched : watchedInfo,
    rating : ratingInfo,
    ratingNum : ratingNum,
    runtime : movie.runtime,
    // no tags when singleton
    tags : [],
    picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
    lbDiaryLink: lbDiaryLink,
    lbFilmLink: movie.lbURL,
    directors : movie.directors,
    available : movie.available,
    views : views,
    previousView : previousView,
    collectionId :
    movie.collection.id !== -1 ? movie.collection.id : undefined,
    collectionName :
    movie.collection.name !== "" ? movie.collection.name : undefined,
  }
}

function filterMovie(movie : any, title: RegExp, year: number[], date: Date[],
                     rating: number[], runtime: number[], tags : RegExp[],
                     director: RegExp, writer : RegExp, actor: RegExp,
                     genre: RegExp, country: RegExp, studio: RegExp,
                     onlywatched: boolean, watchlist: boolean, rewatch: string,
                     collection = -1, collectionName : RegExp):
Movie[] {
  var results : Movie[] = [];
  if ((!watchlist && movie.status === 0)
      || !filterStatic(movie, title, year, runtime,
                       director, writer, actor, genre, country, studio,
                       collection, collectionName))
  {
    return [];
  }
  if (movie.status === 0)
  {
    return [
      {
        id : movie.tmdbId,
        tmdbId : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        runtime : movie.runtime,
        ratingNum: -1,
        picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
        lbFilmLink: movie.lbURL,
        directors : movie.directors,
        available : movie.available,
        watchlist : true,
        collectionId :
          movie.collection.id !== -1 ? movie.collection.id : undefined,
        collectionName :
          movie.collection.name !== "" ? movie.collection.name : undefined,
      }
    ];
  }
  // get latest diary entry to have the rating and watched date, if any
  if (onlywatched)
  {
    results.push(populateMovie(movie, date, rating, tags, rewatch));
  }
  else if (movie.diary.length === 0)
  {
    results.push({
      id : movie.tmdbId,
      tmdbId : movie.tmdbId,
      year : movie.year,
      title : movie.title,
      watched : "",
      rating : "",
      ratingNum : -1,
      runtime : movie.runtime,
      tags : [],
      picture: movie.posterPath? `${posterBaseUrl}${movie.posterPath}` : undefined,
      lbDiaryLink: "",
      lbFilmLink: movie.lbURL,
      directors : movie.directors,
      available : movie.available
    });
  }
  else
  {
    // for each diary entry, create a new movie if it fits criteria
    movie.diary.map((entry) => {
      results.push({
        id : getId(movie.tmdbId, entry.date),
        tmdbId : movie.tmdbId,
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
        directors : movie.directors,
        rewatch : entry.rewatch,
        available : movie.available
      })
    });
  }
  return results.filter((result) =>
    filterDiary(result.watched ? result.watched : "",
                result.ratingNum ? result.ratingNum : -1,
                result.tags ? result.tags : [],
                result.rewatch ? result.rewatch : false,
                date, rating, tags, rewatch));
}

function filterMovies(master : any, title: string, year: string, date: string,
                      rating: string, runtime: string, tags : string,
                      director: string, writer : string, actor: string,
                      genre: string, country: string, studio: string,
                      sorting: string, onlywatched: boolean,
                      watchlist: boolean, rewatch: string, collection = -1):
Promise<Movie[]> {
  var movies : Movie[] = [];
  // create regex ignoring case
  const directorRegex = new RegExp(director !== "" ? director : /.*/, 'i');
  const writerRegex = new RegExp(writer !== "" ? writer : /.*/, 'i');
  const actorRegex = new RegExp(actor !== "" ? actor : /.*/, 'i');
  const genreRegex = new RegExp(genre !== "" ? genre : /.*/, 'i');
  const countryRegex = new RegExp(country !== "" ? country : /.*/, 'i');
  const studioRegex = new RegExp(studio !== "" ? studio : /.*/, 'i');

  // title may contain collection info
  var titleRegex : RegExp;
  var collectionRegex : RegExp;
  if (title.includes(";"))
  {
    var titleSplit = title.split(";");
    titleRegex = new RegExp(titleSplit[0] !== "" ? titleSplit[0] : /.*/, 'i');
    collectionRegex = new RegExp(titleSplit[1] !== "" ? titleSplit[1] : /.*/, 'i');
  }
  else
  {
    titleRegex = new RegExp(title !== "" ? title : /.*/, 'i');
    collectionRegex = new RegExp(/.*/, 'i');
  }

  // tags are a vector of regexes
  var tagsRegexes : RegExp[] = [];
  if (tags !== "")
  {
    const allTags = tags.split(";");
    for (let i = 0; i < allTags.length; i++)
    {
      tagsRegexes.push(new RegExp(allTags[i]))
    }
  }

  if (year.startsWith(".."))
    year = "1900" + year
  // year is "y1[..][y2]". If there isn't ".." then we will set upper
  // bound as y1, otherwise it's y2 if given, otherwise it's current
  // year
  var years : number[] = year === "" ? [] : year.split("..").map(
    (year) => Number(year !== "" ? year : new Date().getFullYear()))
  if (years.length === 1)
  {
    years.push(years[0])
  }

  if (runtime.startsWith(".."))
    runtime = "0" + runtime
  var runtimes : number[] = runtime === "" ? [] : runtime.split("..").map(
    (runtime) => runtime !== "" ? Number(runtime) : 10000)
  if (runtimes.length === 1)
  {
    runtimes.push(runtimes[0])
  }

  if (rating.startsWith(".."))
    rating = "0" + rating
  var ratings : number[] = rating === "" ? [] :
      (rating === "-1" ? [-1,-1] :
       rating.split("..").map((rating) => rating !== "" ? Number(rating) : 10))
  if (ratings.length === 1)
  {
    ratings.push(ratings[0] + 0.9)
  }
  else if (ratings.length > 0)
  {
    ratings[1] = ratings[1] + 0.9;
  }

  if (date.startsWith(".."))
    date = "1900" + date
  var dates : Date[] = date === "-1" ? [new Date(1900), new Date(1900)]: [];
  if (date !== "" && dates.length === 0)
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
                          split[0].length <= 6 ? 0 : dateDay,
                          23, 59));
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
      dates.push(new Date(dateYear, dateMonth, dateDay, 23, 59));
    }
  }

  // console.log("years:", years)
  // console.log("runtimes:", runtimes)
  // console.log("ratings:", ratings)
  // console.log("dates:", dates.map((date) => date.toString()))

  master.movies?.map((movie) => {
    movies = movies.concat(filterMovie(movie, titleRegex, years, dates,
                                       ratings, runtimes, tagsRegexes, directorRegex,
                                       writerRegex, actorRegex, genreRegex,
                                       countryRegex, studioRegex,
                                       onlywatched, watchlist, rewatch,
                                       collection, collectionRegex));
  });
  // >0: a after b; < 0: a before b; === 0: keep order
  if (sorting === "watched")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.watched || movie1.watched.length === 0)
      {
        return 1;
      }
      if (!movie2.watched || movie2.watched.length === 0)
      {
        return -1;
      }
      const split1 = movie1.watched.split("-");
      const split2 = movie2.watched.split("-");
      var year = Number(split1[0]);
      var month = Number(split1[1]) - 1;
      var day = Number(split1[2]);
      var hour = split1.length > 3? Number(split1[3]) : 0;
      const date1 = new Date(year, month, day, hour);
      year = Number(split2[0]);
      month = Number(split2[1]) - 1;
      day = Number(split2[2]);
      hour = split2.length > 3? Number(split2[3]) : 0;
      const date2 = new Date(year, month, day, hour);
      return date2 > date1 ? 1 : -1;
    })
  }
  else if (sorting === "year")
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
  else if (sorting === "rating")
  {
    movies.sort((movie1, movie2) => {
      if (!movie1.ratingNum)
      {
        return 1;
      }
      if (!movie2.ratingNum)
      {
        return -1;
      }
      return movie2.ratingNum - movie1.ratingNum
    })
  }
  else if (sorting === "runtime")
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
  else if (sorting == "views")
  {
    movies.sort((movie1, movie2) => {
      var a = movie1.views;
      var b = movie2.views;
      if (movie1.previousView && a)
        a = a + 1;
      if (movie2.previousView && b)
        b = b + 1;
      if (!a)
      {
        return 1;
      }
      if (!b)
      {
        return -1;
      }
      return b - a;
    })
  }
   return Promise.all(movies).then((movies) => movies);
}

export function getMovies(master: Object[],
                          title: string, year: string, date: string,
                          rating: string, runtime: string, tags : string,
                          director: string,
                          writer: string, actor: string, genre: string,
                          country: string, studio: string,
                          sorting: string, onlywatched: boolean,
                          watchlist: boolean, rewatch: string,
                          available: string, providers: string[] = [],
                          collection = -1
                         ):
Promise<Movie[]> {
  // TODO probably don't need promises anymore here
  return filterMovies(master, title, year, date,
                      rating, runtime, tags, director, writer,
                      actor, genre, country, studio, sorting,
                      onlywatched, watchlist, rewatch, collection)
    .then((movies) => {
      // if we are filtering by availability
      if (available == "only")
      {

      }

      return Promise.all(movies.map((movie) => {
        if (movie.picture)
        {
          if (available == "yes")
            return getAvailable(movie, providers);
          if (movie.available)
            movie.available = undefined;
          return movie;
        }
        return getPicture(movie);
      }))
        .then((results) => results);
    });
}

export interface Movie {
  id: number;
  tmdbId: number;
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
  rewatch?: boolean;
  watchlist?: boolean;
  available?: string[];
  views?: number;
  previousView?: boolean;
  collectionId?: number;
  collectionName?: string
}
