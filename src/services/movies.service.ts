const movieApiBaseUrl = "https://api.themoviedb.org/3";
const posterBaseUrl = "https://image.tmdb.org/t/p/w300";

export function getFavorites(): Promise<Movie[]> {
  // My favorites: MOMMY, THE END OF EVANGELION, 2001, HOTARU NO HAKA
  let res = ["265177", "18491", "62", "12477"];
  return Promise.all(
    res.map((movieId) => getMovie(movieId).then((out) => out[0]))
  );
}

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

//// dunno why this does not work
// import script from "../../python/main.py";

//// this is bad. See https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window/56458070
declare const window: any;

// To prevent issues with loading pyodide multiple times, see
//   https://python.plainenglish.io/python-in-react-with-pyodide-a9c45d4d38ff
// the part about One Final Problem: Multiple Components


function csvToArray(csv : any) : any {
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


async function runScript(code : any, name: string, year: string, date: string,
                         rating: string, runtime: string, director: string,
                         writer : string, actor: string, genre: string,
                         sorting: string, unrated: string):
Promise<Movie[]> {
  console.log("Running script...");
  const pyodide = await window.loadPyodide({
    indexURL : "https://cdn.jsdelivr.net/pyodide/v0.18.1/full/"
  });

  // await pyodide.loadPackage("micropip");
  // pyodide.runPythonAsync(`
  // import micropip
  // await micropip.install('datetime')
  // `);
  // await pyodide.loadPackage("datetime");

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

  // const diaryRows = processCSV(diaryText);
  const masterRows = processCSV(masterText);
  const watchedRows = processCSV(watchedText);
  const watchlistRows = processCSV(watchlistText);
  const mappingRows = processCSV(mapText);

  const diaryRows = csvToArray(diaryText);
  // const masterRows = csvToArray(masterText);
  // const watchedRows = csvToArray(watchedText);
  // const watchlistRows = csvToArray(watchlistText);
  // const mappingRows = csvToArray(mapText);

  // const testText =
  //       await (await fetch(`test.csv`,
  //                          { method: 'get',
  //                            headers: {
  //                              'content-type': 'text/csv;charset=UTF-8',
  //                            }})).text();
  // const testRows = csvToArray(testText);

  // console.log("Rows: (" + rows.length + "): " + rows.forEach((r) => console.log("\n\t" + r.length + ": " + r)));

  console.log("Sorting: " + sorting)
  console.log("Unrated: " + unrated)
  let my_js_namespace = { master : masterRows, diary : diaryRows,
                          watched: watchedRows, watchlist: watchlistRows,
                          mapping: mappingRows, name : name, year : year,
                          date : date, rating : rating, runtime : runtime,
                          director : director, writer : writer, actor : actor,
                          genre : genre, sorting : sorting, unrated : unrated
                        };
  pyodide.registerJsModule("my_js_namespace", my_js_namespace);

  const res = await pyodide.runPythonAsync(code);
  console.log("Debug: " + window.debug);
  console.log("Json: " + res);
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
      lbLink,
      id
    } = movie;

    // console.log("Json entry's watched: " + watched + "; tags: " + tags);
    movies.push({
      id,
      year,
      title,
      release_date: watched,
      rating,
      runtime,
      tags,
      picture: undefined,
      lbDiaryEntry: undefined,
      lbFilmLink: lbLink,
    });
  })
  return movies;
}


export function getMovies(name: string, year: string, date: string,
                          rating: string, runtime: string, director: string,
                          writer: string, actor: string, genre: string,
                          sorting: string, unrated: string
                         ):
Promise<Movie[]> {
  return fetch(
    `main.py`
  )
    .then((res) => res.text())
    .then((scriptText) => runScript(scriptText, name, year, date,
                                    rating, runtime, director, writer,
                                    actor, genre, sorting,
                                    unrated))
    .then((movies) => {
      // let res = Array.from(tmp);
      return Promise.all(movies.map((movie) => (getPicture(movie))))
        .then((results) => results);
    });
}

export interface Movie {
  id: number;
  year?: string;
  title: string;
  release_date: string;
  runtime?: number;
  rating?: string;
  tags?: string[];
  picture?: string;
  lbDiaryEntry?: string;
  lbFilmLink?: string;
}
