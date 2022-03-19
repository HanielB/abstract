import React, { useState, useContext } from "react";
import "./Search.css";
import { getMovie, loadMovies, getMovies } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";
import { Movie, getFavorites } from "../../services/movies.service";

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
  const [src, setSrc] = useState("");
  const [file, setFile] = useState("");
  const { movies, updateMovies, setLoading } = useContext(MoviesContext);

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

  const handleOnSubmitPreloaded = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Handling preloaded");
    setLoading(true);
    console.log("Sorting value: " + sorting);
    console.log("File: " + file);
    getMovies(title, year, date, rating, runtime, tags,
              director, writer, actor, genre,
              sorting ? sorting : "watched",
              src ? src : "diary").then((movies) => {
                console.log("Got back " + movies.length + " movie items");
                setLoading(false);
                updateMovies(movies);
              });
  };

  return (
    <div>
      <form className="form" title="form" onSubmit={(e) => handleOnSubmitPreloaded(e)} noValidate>
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
          <div>Sorting (def "watched"):</div>
          <div><p></p></div>
          <div>
            <input type="radio" id="year" name="sorting" value="year" onChange={(e) => setSorting(e.target.value)}/>
            <label htmlFor="year">Year</label>
          </div>
          <div>
            <input type="radio" id="rating" name="sorting" value="rating" onChange={(e) => setSorting(e.target.value)}/>
            <label htmlFor="rating">Rating</label>
          </div>
          <div>
            <input type="radio" id="runtime" name="sorting" value="runtime" onChange={(e) => setSorting(e.target.value)}/>
            <label htmlFor="runtime">Runtime</label>
          </div>
        </div>
        <div className="form_sort">
          <div>Category:</div>
          <div><p></p></div>
          <div>
            <input type="radio" id="watched" name="src" value="watched" onChange={(e) => setSrc(e.target.value)}
            />
            <label htmlFor="watched">Watched</label>
          </div>
          <div>
            <input type="radio" id="watchlist" name="src" value="watchlist" onChange={(e) => setSrc(e.target.value)}/>
            <label htmlFor="watchlist">Watchlist</label>
          </div>
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
