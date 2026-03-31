import React, { useState, useContext } from "react";
import "./Search.css";
import { getMovie, loadMovies, getMovies, getMoviesFromIds } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";
import { Movie } from "../../services/movies.service";

export const Search = () => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("");
  const [runtime, setRuntime] = useState("");
  const [tags, setTags] = useState("");
  const [director, setDirector] = useState("");
  const [writer, setWriter] = useState("");
  const [actor, setActor] = useState("");
  const [genre, setGenre] = useState("");
  const [studio, setStudio] = useState("");
  const [country, setCountry] = useState("");
  const [sorting, setSorting] = useState("");
  const [rewatch, setRewatch] = useState("");
  const [available, setAvailable] = useState("");

  const {master, movies, updateMovies, setStart, setLoading, setListName, posterOnly, setPosterOnly, cardsPerRow, setCardsPerRow, setSearchWatched, setSearchRating, setSearchTags, setSearchTitle, setSearchYear, setSearchRuntime, setSearchDirector, setSearchWriter, setSearchActor, setSearchGenre, setSearchCountry, setSearchStudio, setSearchSingleton, setSearchWatchlist, setSearchAvailable, setSearchSorting, setSearchRewatch, searchTitle, searchYear, searchRuntime, searchWatched, searchRating, searchTags, searchDirector, searchGenre, searchCountry, searchWriter, searchActor, searchStudio, searchSingleton, searchWatchlist, searchAvailable, searchSorting, searchRewatch } = useContext(MoviesContext);


  if (searchTitle && !title)
  {
    setTitle(searchTitle);
  }
  if (searchYear && !year)
  {
    setYear(searchYear);
  }
  if (searchRuntime && !runtime)
  {
    setRuntime(searchRuntime);
  }
  if (searchWatched && !date)
  {
    setDate(searchWatched);
  }
  if (searchRating && !rating)
  {
    setRating(searchRating);
  }
  if (searchTags && !tags)
  {
    setTags(searchTags);
  }
  if (searchDirector && !director)
  {
    setDirector(searchDirector);
  }
  if (searchWriter && !writer)
  {
    setWriter(searchWriter);
  }
  if (searchActor && !actor)
  {
    setActor(searchActor);
  }
  if (searchGenre && !genre)
  {
    setGenre(searchGenre);
  }
  if (searchCountry && !country)
  {
    setCountry(searchCountry);
  }
  if (searchStudio && !studio)
  {
    setStudio(searchStudio);
  }
  if (searchSorting && searchSorting != "watched" && sorting == "watched")
  {
    setSorting(searchSorting);
  }
  if (searchRewatch && searchRewatch != "yes" && rewatch == "yes")
  {
    setRewatch(searchRewatch);
  }
  if (searchSingleton && searchSingleton === "1")
  {
    const onlywatchedCheck =
      document.getElementById("onlywatched") as HTMLInputElement
    onlywatchedCheck.checked = true
  }
  if (searchWatchlist && searchWatchlist === "1")
  {
    const watchlistCheck =
      document.getElementById("watchlist") as HTMLInputElement
    watchlistCheck.checked = true
  }

  const copyIdsUrl = () => {
    const baseUrl = window.location.href.split("?")[0];
    const ids = movies.map((movie) => movie.tmdbId).join(";");
    const url = baseUrl + "?ids=" + ids;
    navigator.clipboard.writeText(url);
  }

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStart(false);
    setLoading(true);
    const onlywatchedCheck =
          document.getElementById("onlywatched") as HTMLInputElement
    const watchlistCheck =
          document.getElementById("watchlist") as HTMLInputElement
    var onlywatched = onlywatchedCheck? onlywatchedCheck.checked : false;
    const watchlist = watchlistCheck? watchlistCheck.checked : false;

    if (title.includes(";"))
    {
      // force ticks to be true when we are collection searching
      var collectionCheck = document.getElementById("collection") as HTMLInputElement
      if (collectionCheck)
        collectionCheck.checked = true;
      if (onlywatchedCheck)
        onlywatchedCheck.checked = true;
      onlywatched = true;
    }

    var providers: string[] = ["Netflix", "Amazon Prime Video", "HBO Max", "Google Play Movies", "Mubi", "Globoplay", "Disey Plus", "Star Plus", "Criterion Channel"];
    // remove ticked providers
    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type == 'checkbox' && inputs[i].id.startsWith("prov") && inputs[i].checked)
      {
        console.log("Should remove ", inputs[i].value)
        const index = providers.indexOf(inputs[i].value);
        if (index > -1) { // only splice array when item is found
          providers.splice(index, 1); // 2nd parameter means remove one item only
        }
        else
        {
          console.log("..did not remove")
        }
      }
    }
    /* console.log("Active providers ", providers); */

    /* update url with search parameters */
    var currURL = window.location.href;
    console.log("currURL: ", currURL)
    /* discard whatever previous search parameters */
    currURL = currURL.lastIndexOf("?") === -1? currURL.slice(0, currURL.length - 1) : currURL.slice(0, currURL.lastIndexOf("?") - 1)
    console.log("currURL sliced: ", currURL)
    /* for each non-default parameter, add it to the URL */
    var first = true
    var parameters = ""
    parameters += title != "" ? (first? "?" : "&") + "title=" + title.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += year != "" ? (first? "?" : "&") + "year=" + year : ""
    first = parameters === ""

    parameters += runtime != "" ? (first? "?" : "&") + "runtime=" + runtime : ""
    first = parameters === ""

    parameters += date != "" ? (first? "?" : "&") + "watched=" + date : ""
    first = parameters === ""

    parameters += rating != "" ? (first? "?" : "&") + "rating=" + rating : ""
    first = parameters === ""

    parameters += tags != "" ? (first? "?" : "&") + "tags=" + tags : ""
    first = parameters === ""

    parameters += director != "" ? (first? "?" : "&") + "director=" + director.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += writer != "" ? (first? "?" : "&") + "writer=" + writer.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += actor != "" ? (first? "?" : "&") + "actor=" + actor.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += genre != "" ? (first? "?" : "&") + "genre=" + genre.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += country != "" ? (first? "?" : "&") + "country=" + country.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += studio != "" ? (first? "?" : "&") + "studio=" + studio.replaceAll(" ",".") : ""
    first = parameters === ""

    parameters += onlywatchedCheck && onlywatchedCheck.checked ? (first? "?" : "&") + "singleton=1" : ""
    first = parameters === ""

    parameters += watchlistCheck && watchlistCheck.checked ? (first? "?" : "&") + "watchlist=1" : ""
    first = parameters === ""

    parameters += available != "" && available != "no" ? (first? "?" : "&") + "available=" + available : ""
    first = parameters === ""

    parameters += sorting != "" && sorting != "watched" ? (first? "?" : "&") + "sorting=" + sorting : ""
    first = parameters === ""

    parameters += rewatch != "" && rewatch != "yes" ? (first? "?" : "&") + "rewatch=" + rewatch : ""

    console.log("currURL before push: ", currURL)
    console.log("parameters: ", parameters)
    window.history.pushState({}, "", currURL + (parameters != "" ? "/" + parameters : ""));
    setSearchTitle(title);
    setSearchYear(year);
    setSearchRuntime(runtime);
    setSearchWatched(date);
    setSearchRating(rating);
    setSearchTags(tags);
    setSearchDirector(director);
    setSearchWriter(writer);
    setSearchActor(actor);
    setSearchGenre(genre);
    setSearchCountry(country);
    setSearchStudio(studio);
    setSearchSingleton(onlywatched ? "1" : "");
    setSearchWatchlist(watchlist ? "1" : "");
    setSearchAvailable(available || "no");
    setSearchSorting(sorting || "watched");
    setSearchRewatch(rewatch || "yes");

    getMovies(master, title, year, date, rating, runtime, tags,
              director, writer, actor, genre, country, studio,
              sorting ? sorting : "watched", onlywatched,
              watchlist, rewatch, available, providers)
      .then((movies) => {
        console.log("Got back " + movies.length + " movie items");
        setLoading(false);
        updateMovies(movies);
      });
  };

  return (
    <div>
      <form className="form" title="form" onSubmit={(e) => handleOnSubmit(e)} noValidate>
        <div className="form_text">
          <div>
            <input
              type="text"
              name="date"
              className="search__input"
              placeholder="Watched"
              title="Date range: YYYY, YYYYMM, YYYYMMDD, or YYYY..YYYY. Open-ended: 2020.. or ..2020. Add ;regex for location, e.g. 2024;Paris. Use -1 for unwatched."
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="text"
              name="rating"
              className="search__input"
              placeholder="Rating"
              title="Rating 1-10 or range: 8, 7..9. Open-ended: 8.. or ..6. Use -1 for unrated."
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <input
              type="text"
              name="tags"
              className="search__input"
              placeholder="Tags"
              title="Semicolon-separated regexes. All must match. E.g. cinema;cried"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="movie"
              className="search__input"
              placeholder="Title"
              title="Regex for title. Use ; to also filter by collection, e.g. title;collection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              name="year"
              className="search__input"
              placeholder="Year"
              title="Release year or range: 2020, 1990..2000. Open-ended: 2000.. or ..1980"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              type="text"
              name="runtime"
              className="search__input"
              placeholder="Runtime"
              title="Runtime in minutes or range: 120, 90..150. Open-ended: 120.. or ..90"
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="director"
              className="search__input"
              placeholder="Director"
              title="Regex, case-insensitive. E.g. tarantino, spielberg|scorsese"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            />
            <input
              type="text"
              name="writer"
              className="search__input"
              placeholder="Writer"
              title="Regex, case-insensitive. E.g. kaufman, coen"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
            />
            <input
              type="text"
              name="actor"
              className="search__input"
              placeholder="Actor"
              title="Regex, case-insensitive. E.g. pitt, streep|blanchett"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="genre"
              className="search__input"
              placeholder="Genre"
              title="Regex, case-insensitive. E.g. horror, drama|comedy"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <input
              type="text"
              name="country"
              className="search__input"
              placeholder="Country"
              title="Regex, case-insensitive. E.g. france, japan|korea"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <input
              type="text"
              name="studio"
              className="search__input"
              placeholder="Studio"
              title="Regex, case-insensitive. E.g. a24, pixar"
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
            />
          </div>
        </div>
        <div className="form_buttons">
          <div className="dropdowns">
            <div className="dropdown">
              <button className="search__input">Sorting</button>
              <div className="dropdown-content">
                <a onClick={(e) => setSorting("watched")}>Watched</a>
                <a onClick={(e) => setSorting("year")}>Year</a>
                <a onClick={(e) => setSorting("rating")}>Rating</a>
                <a onClick={(e) => setSorting("runtime")}>Runtime</a>
                <a onClick={(e) => {
                  // also forces "singleton" to be true
                  setSorting("views");
                  var onlywatchedCheck =
                    document.getElementById("onlywatched") as HTMLInputElement
                  if (onlywatchedCheck)
                  {
                    onlywatchedCheck.checked = true;
                  }
                }}>Views</a>
              </div>
            </div>
            <div className="dropdown">
              <button className="search__input">Rewatch</button>
              <div className="dropdown-content">
                <a onClick={(e) => setRewatch("yes")}>Yes</a>
                <a onClick={(e) => setRewatch("no")}>No</a>
                <a onClick={(e) => setRewatch("only")}>Only</a>
              </div>
            </div>
            <div className="dropdown">
              <button className="search__input">Available</button>
              <div className="dropdown-content">
                <a onClick={(e) => setAvailable("yes")}>Yes</a>
                <a onClick={(e) => setAvailable("no")}>No</a>
                <a onClick={(e) => setAvailable("only")}>Only</a>
              </div>
            </div>
            <div className="dropdown">
              <button className="search__input">Providers</button>
              <div className="dropdown-content">
                <ul className="items">
                  <li><input type="checkbox" id="prov-crc" name="display" value="Criterion Channel"/>rm Criterion </li>
                  <li><input type="checkbox" id="prov-mbi" name="display" value="Mubi"/>rm Mubi</li>
                  <li><input type="checkbox" id="prov-nfx" name="display" value="Netflix"/>rm Netflix</li>
                  <li><input type="checkbox" id="prov-prv" name="display" value="Amazon Prime Video"/>rm Prime</li>
                  <li><input type="checkbox" id="prov-hbm" name="display" value="HBO Max"/>rm HBO</li>
                  <li><input type="checkbox" id="prov-hbm" name="display" value="Google Play Movies"/>rm Google Play</li>
                  <li><input type="checkbox" id="prov-srp" name="display" value="Star Plus"/>rm Star+</li>
                  <li><input type="checkbox" id="prov-dnp" name="display" value="Disney Plus"/>rm Disney+</li>
                  <li><input type="checkbox" id="prov-gop" name="display" value="Globoplay"/>rm Globo</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="form_sort">
            <fieldset>
              <legend>Display</legend>
              <div className="form_radio">
                <div>
                  <input type="checkbox" id="onlywatched" name="display" value="onlywatched" title="Show one entry per film, using the latest diary entry"/>
                  <label htmlFor="onlywatched">Singleton</label>
                </div>
                <div>
                  <input type="checkbox" id="watchlist" name="display" value="watchlist" title="Include films from watchlist (not yet watched)"/>
                  <label htmlFor="watchlist">Watchlist</label>
                </div>
              </div>
              <div className="form_radio">
                <div>
                  <input type="checkbox" id="collection" name="display" value="collection" title="Group films by TMDB collection (e.g. trilogies, franchises)"/>
                  <label htmlFor="collection">Collection</label>
                </div>
                <div>
                  <input type="checkbox" id="posteronly" checked={posterOnly} onChange={(e) => setPosterOnly(e.target.checked)} title="Show only posters, hiding the info panel"/>
                  <label htmlFor="posteronly">No card</label>
                </div>
              </div>
            </fieldset>
            <div className="card-size-slider">
              <label>Cards per row</label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                title={`${cardsPerRow}`}
                value={cardsPerRow}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCardsPerRow(val);
                  localStorage.setItem("cardsPerRow", val.toString());
                }}
              />
              <label className="count count-mobile">
                {movies.length + " films"}
              </label>
            </div>
            <label className="count count-desktop">
              {movies.length + " films"}
            </label>
          </div>
        </div>
        <div className="form_buttons_search">
          <button name="Button" className="search__button" type="submit">Search</button>
          <button name="Button" className="search__button" type="button" onClick={() => copyIdsUrl()}>Copy URL</button>
        </div>
      </form>
    </div>
  );
};
