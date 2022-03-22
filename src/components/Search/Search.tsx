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
  const [sorting, setSorting] = useState("");
  const [file, setFile] = useState("");
  const {master, movies, updateMovies, setLoading} = useContext(MoviesContext);

  const exportToJsonFile = () => {
    let dataStr = JSON.stringify(movies);
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
          var loadedMovies = JSON.parse(fr.result as string);
          updateMovies(loadedMovies);
        }
        fr.readAsText(files[0]);
    }
  };

  const handleOnSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Handling search");
    setLoading(true);
    console.log("Sorting value: " + sorting);
    const onlywatchedCheck =
          document.getElementById("onlywatched") as HTMLInputElement
    const watchlistCheck =
          document.getElementById("watchlist") as HTMLInputElement
    const norewatchCheck = document.getElementById("norewatch") as HTMLInputElement
    const onlywatched = onlywatchedCheck? onlywatchedCheck.checked : false;
    const watchlist = watchlistCheck? watchlistCheck.checked : false;
    const rewatch = norewatchCheck? !norewatchCheck.checked : true;
    getMovies(master, title, year, date, rating, runtime, tags,
              director, writer, actor, genre,
              sorting ? sorting : "watched", onlywatched, watchlist, rewatch)
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
              className="search__input"
              placeholder="Title ... "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              name="date"
              className="search__input"
              placeholder="Date ... "
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="year"
              className="search__inputShort"
              placeholder="Year ... "
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              type="text"
              name="rating"
              className="search__inputShort"
              placeholder="Rating ... "
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <input
              type="text"
              name="runtime"
              className="search__inputShort"
              placeholder="Runtime ... "
              value={runtime}
              onChange={(e) => setRuntime(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              name="tags"
              className="search__input"
              placeholder="Tags ... "
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <input
              type="text"
              name="director"
              className="search__input"
              placeholder="Director ... "
              value={director}
              onChange={(e) => setDirector(e.target.value)}
            />
          </div>
        </div>
        <div className="form_sort">
          <fieldset>
            <legend>Sorting</legend>
            <div className="form_radio">
              <div className="form_radio_label">
                <input type="radio" id="watched" name="sorting" value="watched" checked={true} onChange={(e) => setSorting(e.target.value)}/>
                <label htmlFor="watched">Watched</label>
              </div>
              <div className="form_radio_label">
              <input type="radio" id="year" name="sorting" value="year" onChange={(e) => setSorting(e.target.value)}/>
              <label htmlFor="year">Year</label>
            </div>
            </div>
            <div className="form_radio_label">
              <input type="radio" id="rating" name="sorting" value="rating" onChange={(e) => setSorting(e.target.value)}/>
              <label htmlFor="rating">Rating</label>
            </div>
            <div className="form_radio_label">
              <input type="radio" id="runtime" name="sorting" value="runtime" onChange={(e) => setSorting(e.target.value)}/>
              <label htmlFor="runtime">Runtime</label>
            </div>
          </fieldset>
        </div>
        <div className="form_sort">
          <fieldset>
            <legend>Display</legend>
            <div>
              <input type="checkbox" id="onlywatched" name="display" value="onlywatched"/>
              <label htmlFor="onlywatched">Only watched</label>
            </div>
            <div>
              <input type="checkbox" id="watchlist" name="display" value="watchlist"/>
              <label htmlFor="watchlist">Watchlist</label>
            </div>
            <div>
              <input type="checkbox" id="norewatch" name="display" value="norewatch"/>
              <label htmlFor="rewatch">No Rewatches</label>
            </div>
          </fieldset>
        </div>

        <div className="form_buttons">
          <button name="Button" className="search__button" type="submit">Search</button>
          <button name="Button" className="search__button" type="button" onClick={(e) => exportToJsonFile()}>Download</button>
          <label className="search__button">
            <input type="file" onChange={(e) => handleUpload(e)}/>
            LOAD
          </label>
        </div>
      </form>
    </div>
  );
};
