import React, { useState, useContext } from "react";
import "./Search.css";
import { getMovie, loadMovies, getMovies } from "../../services/movies.service";
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
  const [file, setFile] = useState("");
  const {master, movies, updateMovies, setLoading, setListName} = useContext(MoviesContext);

  // have providers on by default
  var inputs = document.getElementsByTagName('input');
  for (var i = 0; i < inputs.length; i++)  {
    if (inputs[i].type == 'checkbox' && inputs[i].id.startsWith("prov"))   {
      inputs[i].checked = true;
    }
  }

  const exportToJsonFile = () => {
    var exportOjb = {"title": "", "movies": movies}
    let title = prompt("Please enter list name", "");
    exportOjb.title = title? title : "";
    let dataStr = JSON.stringify(exportOjb);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  const handleUpload = (e : React.ChangeEvent<HTMLInputElement>) => {
    var files = e.target.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
          if (!fr.result)
          {
            console.log("File is null");
            return;
          }
          var loadedList = JSON.parse(fr.result as string);
          setListName(loadedList.title);
          updateMovies(loadedList.movies);
        }
        fr.readAsText(files[0]);
    }
  }

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const onlywatchedCheck =
          document.getElementById("onlywatched") as HTMLInputElement
    const watchlistCheck =
          document.getElementById("watchlist") as HTMLInputElement
    const availableCheck = document.getElementById("available") as HTMLInputElement
    var onlywatched = onlywatchedCheck? onlywatchedCheck.checked : false;
    const watchlist = watchlistCheck? watchlistCheck.checked : false;
    const available = availableCheck? availableCheck.checked : false;

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

    getMovies(master, title, year, date, rating, runtime, tags,
              director, writer, actor, genre, country, studio,
              sorting ? sorting : "watched", onlywatched,
              watchlist, rewatch, available)
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
              name="movie"
              className="search__inputLong"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              name="year"
              className="search__inputShort"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              type="text"
              name="runtime"
              className="search__inputShorter"
              placeholder="Runtime"
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="date"
              className="search__inputShort"
              placeholder="Watched"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="text"
              name="rating"
              className="search__inputShorter"
              placeholder="Rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <input
              type="text"
              name="tags"
              className="search__inputLong"
              placeholder="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="director"
              className="search__input"
              placeholder="Director"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            />
            <input
              type="text"
              name="genre"
              className="search__input"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
            <input
              type="text"
              name="country"
              className="search__input"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="writer"
              className="search__input"
              placeholder="Writer"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
            />
            <input
              type="text"
              name="actor"
              className="search__input"
              placeholder="Actor"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
            />
            <input
              type="text"
              name="studio"
              className="search__input"
              placeholder="Studio"
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
              <ul className="items">
                <li><input type="checkbox" id="prov-crc" name="display" value="prov-crc"/>Criterion </li>
                <li><input type="checkbox" id="prov-mbi" name="display" value="prov-mbi"/>Mubi</li>
                <li><input type="checkbox" id="prov-nfx" name="display" value="prov-nfx"/>Netflix</li>
                <li><input type="checkbox" id="prov-prv" name="display" value="prov-prv"/>Prime </li>
                <li><input type="checkbox" id="prov-hbm" name="display" value="prov-hbm"/>HBO </li>
                <li><input type="checkbox" id="prov-srp" name="display" value="prov-srp"/>Star+ </li>
                <li><input type="checkbox" id="prov-dnp" name="display" value="prov-dnp"/>Disney+ </li>
                <li><input type="checkbox" id="prov-gop" name="display" value="prov-gop"/>Globo</li>
              </ul>
            </div>
          </div>
        </div>
          <div className="form_sort">
            <fieldset>
              <legend>Display</legend>
              <div className="form_radio">
                <div>
                  <input type="checkbox" id="onlywatched" name="display" value="onlywatched"/>
                  <label htmlFor="onlywatched">Singleton</label>
                </div>
                <div>
                  <input type="checkbox" id="watchlist" name="display" value="watchlist"/>
                  <label htmlFor="watchlist">Watchlist</label>
                </div>
              </div>
              <div className="form_radio">
                <div>
                  <input type="checkbox" id="available" name="display" value="available"/>
                  <label htmlFor="available">Available</label>
                </div>
                <div>
                  <input type="checkbox" id="collection" name="display" value="collection"/>
                  <label htmlFor="collection">Collection</label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="form_buttons">
          <button name="Button" className="search__button" type="submit">Search</button>
          <button name="Button" className="search__button" type="button" onClick={(e) => exportToJsonFile()}>Download</button>
          <label className="search__button">
            <input type="file" onChange={(e) => handleUpload(e)}/>
            UPLOAD
          </label>
        </div>
      </form>
    </div>
  );
};
