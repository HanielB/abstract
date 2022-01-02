import React, { useState, useContext } from "react";
import "./Search.css";
import { searchMovies, getMovie, loadMovies, getMovies } from "../../services/movies.service";
import { MoviesContext } from "../../services/context";

export const Search = () => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("");
  const [runtime, setRuntime] = useState("");
  const [director, setDirector] = useState("");
  const [actor, setActor] = useState("");
  const [genre, setGenre] = useState("");
  const [sorting, setSorting] = useState("");
  const [unrated, setUnrated] = useState("");
  const { updateMovies, setLoading } = useContext(MoviesContext);

  const handleOnSubmitPreloaded = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Handling preloaded");
    setLoading(true);
    getMovies(name).then((movies) => {
      console.log("Got back " + movies.length + " movie items");
      setLoading(false);
      updateMovies(movies);
    });
  };

  return (
    <div>
      <form name="form" onSubmit={(e) => handleOnSubmitPreloaded(e)} noValidate>
        <input
          type="text"
          name="movie"
          className="search__input"
          placeholder="Name ... "
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          name="year"
          className="search__input"
          placeholder="Year ... "
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="text"
          name="date"
          className="search__input"
          placeholder="Date ... "
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          name="rating"
          className="search__input"
          placeholder="Rating ... "
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <input
          type="text"
          name="runtime"
          className="search__input"
          placeholder="Runtime ... "
          value={runtime}
          onChange={(e) => setRuntime(e.target.value)}
        />
        <input
          type="text"
          name="director"
          className="search__input"
          placeholder="Director ... "
          value={director}
          onChange={(e) => setDirector(e.target.value)}
        />
        <input
          type="text"
          name="actor"
          className="search__input"
          placeholder="Actor ... "
          value={actor}
          onChange={(e) => setActor(e.target.value)}
        />
        <input
          type="text"
          name="genre"
          className="search__input"
          placeholder="Genre ... "
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <label>
          <input type="checkbox" name="checkbox"
                 value={unrated}
                 onChange={(e) => setUnrated(e.target.value)}
          />
          Unrated
        </label>

        <div>
          <p>Sorting:</p>
        <div>
          <input type="radio" id="wacthed" name="sorting" value="watched"
                 />
          <label htmlFor="watched">Watched</label>
        </div>
        <div>
          <input type="radio" id="year" name="sorting" value="year"/>
          <label htmlFor="year">Year</label>
        </div>
        <div>
          <input type="radio" id="rating" name="sorting" value="rating"/>
          <label htmlFor="rating">Rating</label>
        </div>
        <div>
          <input type="radio" id="runtime" name="sorting" value="runtime"/>
          <label htmlFor="runtime">Runtime</label>
        </div>
        </div>
        <button name="Button" className="search__button" type="submit">Search</button>
      </form>
    </div>
  );
};
