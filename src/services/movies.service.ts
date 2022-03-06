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

//// dunno why this does not work
// import script from "../../python/main.py";

//// this is bad. See https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window/56458070
declare const window: any;

// To prevent issues with loading pyodide multiple times, see
//   https://python.plainenglish.io/python-in-react-with-pyodide-a9c45d4d38ff
// the part about One Final Problem: Multiple Components


function csvToArray(csv : any, dos = false) : any {
  const rowsFlat = csv.slice(csv.indexOf("\n") + 1).split("\n");
  var parsed : string[][] = [];
  for (let i = 0; i < rowsFlat.length; i++)
  {
    // const test = rowsFlat[0];
    const test = rowsFlat[i];
    if (test.length == 0)
    {
      continue;
    }
    // console.log("Test with " + test);
    var fields : string[] = [];
    var curr : string = "";
    var escaping = false;
    for (let j = 0; j < test.length; j++) {
      if (escaping)
      {
        if (test[j] === "\"" && test[j+1] === ",")
        {
          escaping = false;
          continue;
        }
      }
      else
      {
        if (test[j] === "," || j === (test.length - 1))
        {
          // don't miss last char if not in a DOS file (which alwas
          // end with weird newline char)
          if (!dos && j === (test.length - 1))
          {
            curr += test[j];
          }
          fields.push(curr);
          curr = "";
          continue;
        }
        if (test[j] === "\"" && (j === 0 || test[j-1] === ","))
        {
          escaping = true;
          continue;
        }
      }
      curr += test[j];
    }
    // if row inds in comma, the above would not add a field
    if (test[test.length - 1] == ",")
    {
      fields.push("")
    }
    // if (fields.length != 8)
    // {
    //   console.log("From line " + test + " \n\t got " + fields.length + " elements: " + fields);
    // }
    parsed.push(fields)
  }
  return parsed;
}


function processCSV(csv : any) : any {
  const rowsFlat = csv.slice(csv.indexOf("\n") + 1).split("\n");
  return rowsFlat.map((row) => row.split(","));
}

function filterMovie(movie : any, name: string, year: string, date: string,
                         rating: string, runtime: string, tags : string[],
                         director: string, writer : string, actor: string,
                         genre: string,
                     src : string):
Movie[] {
  console.log("Filtering ", movie.title, movie.year, "; status ", movie.status)
  var result : Movie[] = [];
  if (src == "watchlist")
  {
    if (movie.status > 0)
    {
      return result;
    }
    // TODO
    return result;
  }
  if (movie.status === 0)
  {
    return result;
  }
  // get latest diary entry to have the rating and watched date, if any
  if (src == "watched")
  {
    // TODO get watched and rating and link
    return [
      {
        id : movie.tmdbId,
        year : movie.year,
        title : movie.title,
        watched : "",
        rating : "",
        runtime : movie.runtime,
        tags : [],
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

function filterMovies(master : any, name: string, year: string, date: string,
                         rating: string, runtime: string, tags : string[],
                         director: string, writer : string, actor: string,
                         genre: string, sorting: string,
                         src : string):
Promise<Movie[]> {
  console.log("Now process with src ", src);
  var movies : Movie[] = [];
  master.movies.map((movie) => {
    movies = movies.concat(filterMovie(movie, name, year, date,
                                       rating, runtime, tags, director, writer,
                                       actor, genre, src));
  });
  // TODO sorting
  return Promise.all(movies).then((movies) => movies);
}


async function runScript(code : any, name: string, year: string, date: string,
                         rating: string, runtime: string, tags : string[],
                         director: string, writer : string, actor: string,
                         genre: string, sorting: string,
                         src : string):
Promise<Movie[]> {
  console.log("Running script...");
  const pyodide = await window.loadPyodide({
    indexURL : "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
  });

  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync(`
  import micropip
  await micropip.install('unidecode')
  `);

  await pyodide.loadPackage("python-dateutil");

  console.log("Loaded pyodide. Now fetch csv");

  const diaryText =
        await (await fetch(`diary.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();
  const watchlistText =
        await (await fetch(`watchlist.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();
  const masterText =
        await (await fetch(`master.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();
  const mapText =
        await (await fetch(`map.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();
  const watchedText =
        await (await fetch(`watched.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();

  const ratingsText =
        await (await fetch(`ratings.csv`,
                           { method: 'get',
                             headers: {
                               'content-type': 'text/csv;charset=UTF-8',
                             }})).text();

  const diaryRows = csvToArray(diaryText, true);
  const masterRows = csvToArray(masterText);
  const watchedRows = csvToArray(watchedText, true);
  const watchlistRows = csvToArray(watchlistText, true);
  const mappingRows = csvToArray(mapText);
  const ratingsRows = csvToArray(ratingsText);

  console.log("Now process");

  // console.log("Read\n" + mappingRows)

  // const testText =
  //       await (await fetch(`test.csv`,
  //                          { method: 'get',
  //                            headers: {
  //                              'content-type': 'text/csv;charset=UTF-8',
  //                            }})).text();
  // const testRows = csvToArray(testText);

  // console.log("Rows: (" + rows.length + "): " + rows.forEach((r) => console.log("\n\t" + r.length + ": " + r)));

  let my_js_namespace = { master : masterRows, diary : diaryRows,
                          watched: watchedRows, watchlist: watchlistRows,
                          mapping: mappingRows, ratings: ratingsRows, name : name, year : year,
                          date : date, rating : rating, runtime : runtime,
                          tags : tags,
                          director : director, writer : writer, actor : actor,
                          genre : genre, sorting : sorting,
                          src : src
                        };
  pyodide.registerJsModule("my_js_namespace", my_js_namespace);

  const res = await pyodide.runPythonAsync(code);
  // console.log("Debug: " + window.debug);
  // console.log("Json: " + res);
  if (res === "")
    return []
  const jsonResult = JSON.parse(res);
  var movies : Movie[] = [];
  jsonResult.items.map((movie) => {
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
    movies.push({
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
    });
  })
  return movies;
}


export function getMovies(name: string, year: string, date: string,
                          rating: string, runtime: string, tags : string[],
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
    .then((master) => filterMovies(master, name, year, date,
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
  tags?: string[];
  picture?: string;
  lbDiaryLink?: string;
  lbFilmLink?: string;
  directors?: string[];
}
