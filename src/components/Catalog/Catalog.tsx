import React, { useContext, useReducer, useState, useRef, useEffect, useCallback } from "react";
import "./Catalog.css";
import imgPlaceholder from "./movie_placeholder.png";
import viewsImg from "./watched.png";
import rewatchImg from "./two-circular-arrows.png";
import watchlistImg from "./not-watched.png";
import downloadImg from "./download.png";
import cinemaImg from "./cinema.svg";
import { MoviesContext } from "../../services/context";
import { Movie, DiaryEntry, getMovies } from "../../services/movies.service";


// vertical (singleton) cards: the card width a 13px info block is tuned for
const REF_CARD_WIDTH = 29 * 13;
// the type never gets smaller than it is at this many cards per row (one on a
// phone, three elsewhere; the breakpoint is Catalog.css's): narrower cards keep
// that size and wrap instead, so a dense grid stays as readable as a sparse one
const MOBILE_MAX_WIDTH = 540;
const REF_CARDS_MOBILE = 1;
const REF_CARDS_DESKTOP = 3;

export const Catalog = () => {
  const { master, movies, start, loading, selected, posterOnly, cardsPerRow,
          setLoading, updateMovies, setSelected, setListName } =
        useContext(MoviesContext);
  // singleton results carry a view count instead of a watch date; those are
  // the ones shown as vertical cards, whether they come from the singleton
  // search, a list, an id set or the start page. Watchlist films never have a
  // view count, so it takes one card with one to call the whole grid singleton.
  const vertical = !posterOnly && movies.some((movie) => movie.views !== undefined);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [openDiaryPopup, setOpenDiaryPopup] = useState<number | null>(null);
  const [openReview, setOpenReview] = useState<{title: string, year?: string, date: string, rating?: string, rewatch?: boolean, review: string, tags?: string[], lbDiaryLink?: string, location?: string, diaryEntries?: DiaryEntry[], previousView?: boolean} | null>(null);
  const [diaryExpanded, setDiaryExpanded] = useState(false);

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, [updateContainerWidth]);

  const cardWidthPercent = 100 / cardsPerRow;
  const cardWidth = containerWidth > 0 ? Math.floor(containerWidth / cardsPerRow) : 460;
  // like the row cards' zoom, the vertical cards' type follows the card width,
  // but only down to the width of a reference card: past that the cards get
  // narrower and the type stays put
  const refCards = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches
                 ? REF_CARDS_MOBILE : REF_CARDS_DESKTOP;
  const refCardWidth = containerWidth > 0
                     ? Math.floor(containerWidth / Math.min(cardsPerRow, refCards)) : 460;
  const baseFs = 13 * refCardWidth / REF_CARD_WIDTH;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenReview(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (openDiaryPopup === null) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.views')) {
        setOpenDiaryPopup(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openDiaryPopup]);

  // remove all selected cards
  const handleRemoval = () => {
    if (selected.length === 0)
      return;
    var newMovies : Movie[] = [];
    movies.map((movie) => {
      if (!selected.includes(movie.id))
      {
        newMovies.push(movie);
      }
    });
    setSelected([]);
    updateMovies(newMovies);
  }

  // move given card "move" positions
  const handleMove = (id: number, move: number) => {
    var foundIndex = -1;
    var newIndex = -1;
    for (let i = 0; i < movies.length; i++)
    {
      if (movies[i].id === id)
      {
        foundIndex = i;
        newIndex = Math.min(Math.max(0, i + move), movies.length);
      }
    }
    var newMovies : Movie[] = [];
    // going left
    if (move < 0)
    {
      // get movies up to new index
      newMovies = movies.slice(0, newIndex);
      // put at new index
      newMovies.push(movies[foundIndex]);
      // put everybody between that index and the original index of the moved guy
      newMovies.push(...movies.slice(newIndex, foundIndex));
      // put everybody after original index
      newMovies.push(...movies.slice(foundIndex + 1))
    }
    // going right
    else
    {
      // get movies up to original index
      newMovies = movies.slice(0, foundIndex);
      // get everybody after original index and up to new index (inclusive)
      newMovies.push(...movies.slice(foundIndex + 1, newIndex + 1));
      // put at new index
      newMovies.push(movies[foundIndex]);
      // put everybody after new index
      newMovies.push(...movies.slice(newIndex + 1))
    }
    updateMovies(newMovies);
  }

  const handleCardCtrlClick = (id: number) => {
    if (selected.includes(id))
    {
      // make selected as old one minus the given id
      setSelected(selected.filter(e => e !== id));
      return;
    }
    selected.push(id);
    forceUpdate();
  }

  const handleCardShiftClick = (id: number) => {
    var foundIndex = -1;
    var firstIndex = -1;
    for (let i = 0; i < movies.length; i++)
    {
      if (firstIndex === -1 && selected.includes(movies[i].id))
      {
        firstIndex = i;
        continue;
      }
      if (movies[i].id === id)
        foundIndex = i;
    }
    // if only selecting, set this guy as selected, in case it is not
    if (firstIndex === -1)
    {
      if (!selected.includes(id))
      {
        selected.push(id);
        forceUpdate();
      }
      return;
    }
    // select everybody from first index to found index
    selected.push(...movies.slice(firstIndex + 1,
                                  foundIndex + 1).map((movie) => movie.id));
    forceUpdate();
  }

  const getDirected = (director: string) => {
    setLoading(true);
    getMovies(master, "", "", "", "", "", "",
              director, "", "", "", "", "",
              "year", true, true, "", "yes")
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getTag = (tag: string) => {
    setLoading(true);
    setListName("");
    getMovies(master, "", "", "", "", "", tag,
              "", "", "", "", "", "",
              "watched", false, false, "", "yes")
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getCollection = (collectionId?: number) => {
    setLoading(true);
    setListName("");
    console.log("Get films with cId ", collectionId)
    getMovies(master, "", "", "", "", "", "",
              "", "", "", "", "", "",
              "year", true, true, "", "yes", [], collectionId)
      .then((movies) => {
        setLoading(false);
        updateMovies(movies);
      });
  }

  const getIcon = (prov : string) => {
    if (prov === "Netflix") return "https://a.ltrbxd.com/sm/upload/za/bp/jc/zn/netflix-small.png";
    if (prov === "Amazon Prime Video") return "https://images.justwatch.com/icon/52449861/s100"
    if (prov === "HBO Max") return "https://images.justwatch.com/icon/182948653/s100"
    if (prov === "Globoplay") return "https://images.justwatch.com/icon/136871678/s100"
    if (prov === "Mubi") return "https://a.ltrbxd.com/sm/upload/0t/1m/aa/u9/mubi.png?k=371edba60c"
    if (prov === "Google Play Movies") return "https://a.ltrbxd.com/sm/upload/o0/8s/mp/ej/google-small.png?k=c07a6d2d92"
    if (prov === "Disney Plus") return "https://images.justwatch.com/icon/147638351/s100"
    if (prov === "Criterion Channel") return "https://a.ltrbxd.com/sm/upload/j6/4v/o4/ru/criterionchannel-small.png?k=d168bd1a60"
    if (prov === "Star Plus") return "https://images.justwatch.com/icon/250272035/s100"
    if (prov === "local") return downloadImg;
    return imgPlaceholder;
  }

  if (loading) {
    return (<div>
              <h1>LOADING</h1>
            </div>);
  }
  const collectionCheck = document.getElementById("collection") as HTMLInputElement
  const collection = collectionCheck? collectionCheck.checked : false;

  return (
    <div className="catalogContainer" id="catalog" ref={containerRef} style={{ "--card-width": `${cardWidthPercent}%`, "--card-scale": cardWidth / 460, "--fs": `${baseFs}px` } as React.CSSProperties}>
      {movies.map((movie, idx) => (
        <div className={
               "catalog__item" + (selected.includes(movie.id) ? "__selected" : "")
               + (posterOnly ? " catalog__item--posteronly" : "")
               + (vertical ? " catalog__item--vertical" : "")
               + (movie.watchlist ? " catalog__item--unwatched" : "")
             }
             tabIndex={0}
             key={movie.id}
             onClick={(e) => {
               if (e.ctrlKey)
                 handleCardCtrlClick(movie.id);
               else if (e.shiftKey)
                 handleCardShiftClick(movie.id);
             }}
             onKeyDown={(e) => {
               // if backspace or delete is pressed
               if (e.keyCode === 8 || e.keyCode === 46) {
                 handleRemoval();
               }
               // left arrow  37, up arrow  38, right arrow 39, down arrow  40
               else if (e.keyCode === 37)
               {
                 handleMove(movie.id, -1);
               }
               else if (e.keyCode === 38)
               {
                 handleMove(movie.id, -4);
               }
               else if (e.keyCode === 39)
               {
                 handleMove(movie.id, 1);
               }
               else if (e.keyCode === 40)
               {
                 handleMove(movie.id, 4);
               }
             }}
        >
          <div className="catalog__item__img">
            <img src={movie.picture || imgPlaceholder} alt={movie.title}
              title={posterOnly ? `${movie.title} (${movie.year || "?"})${movie.watched ? "\n" + movie.watched.substring(0, 10) : ""}${movie.rating ? " — " + movie.rating : ""}` : undefined}
            />
            {vertical && movie.available && movie.available.length > 0 &&
              <div className="available">
                {movie.available.map((prov) => (
                  <span>
                    <img className="provider" src={getIcon(prov)} />
                  </span>
                ))}
              </div>
            }
          </div>
          {vertical && <div className="catalog__item__info catalog__item__info--vertical">
            <div className="head">
              <span className="title">
                <a href={movie.lbFilmLink}>
                  {movie.title}
                </a>
                {movie.tmdbId && (
                  <span className="tmdb-id-tooltip">
                    ID: {movie.tmdbId}
                    <button
                      className="copy-id-btn"
                      title="Copy TMDB ID"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(movie.tmdbId!.toString());
                      }}
                    >
                      📋
                    </button>
                  </span>
                )}
              </span>
              {" "}
              <span className="year">
                ({movie.year}{movie.country? ", " + movie.country.toUpperCase() : ""})
              </span>
            </div>
            <div className="directors">
              {(movie.directors)?
               movie.directors.map((director) => (
                 <span className="director"
                       onClick={(e) => getDirected(director)}>
                   {director}
                 </span>
               )) : <span></span>}
            </div>
            <div className="foot">
              {movie.watchlist &&
                <img className="watchlistImg" src={watchlistImg} />
              }
              <span className="runtime">
                {movie.runtime}min
              </span>
              {movie.views !== undefined && (movie.views > 0 || movie.previousView) &&
                <span className="views" onClick={(e) => {
                  e.stopPropagation();
                  setOpenDiaryPopup(openDiaryPopup === movie.id ? null : movie.id);
                }}>
                  <img src={viewsImg} className="watchedImg" />
                  <span className="floatingNumber">
                    {movie.views}{movie.previousView? "+" : ""}
                  </span>
                  {movie.diaryEntries && movie.diaryEntries.length > 0 &&
                    <div className={`diaryPopup${openDiaryPopup === movie.id ? ' diaryPopupOpen' : ''}`}>
                      {[...movie.diaryEntries].reverse().map((entry, i) => (
                        <div className="diaryPopupEntry" key={i}>
                          <span className="diaryPopupDate">
                            <a href="#" onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenReview({title: movie.title, year: movie.year, date: entry.date.substring(0, 10), rating: entry.rating, rewatch: entry.rewatch, review: entry.review || "", tags: entry.tags, lbDiaryLink: entry.entryURL, location: entry.location, diaryEntries: movie.diaryEntries});
                              setDiaryExpanded(false);
                            }}>{entry.date.split("-").length > 3 ? entry.date.substring(0, 10) : entry.date}</a>
                          </span>
                          <span className="diaryPopupRating">{entry.rating}</span>
                          <span className="diaryPopupLocation">{entry.location}</span>
                          {entry.tags && entry.tags.includes("cinema") && <img src={cinemaImg} className="diaryPopupCinema" alt="cinema" />}
                        </div>
                      ))}
                    </div>
                  }
                </span>
              }
              <span className={movie.rating? "ratingPill" : "ratingPill ratingPill--empty"}>
                {movie.rating || "0"}
              </span>
            </div>
          </div>}
          {!posterOnly && !vertical && <div className="catalog__item__info">
            <div className="titleYear">
              <span className="title">
                <a href={movie.lbFilmLink}>
                  {movie.title}
                </a>
                {movie.tmdbId && (
                  <span className="tmdb-id-tooltip">
                    ID: {movie.tmdbId}
                    <button
                      className="copy-id-btn"
                      title="Copy TMDB ID"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(movie.tmdbId!.toString());
                      }}
                    >
                      📋
                    </button>
                  </span>
                )}
              </span>
              <span className="year">
                ({movie.year}{movie.country? ", " + movie.country.toUpperCase() : ""})
              </span>
            </div>
            <div className="watchedRating">
              <div className="watchedDateLoc" style={movie.views !== undefined ? {visibility: 'hidden'} : undefined}>
                <span className="watched">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenReview({title: movie.title, year: movie.year, date: movie.watched?.substring(0, 10) || "", rating: movie.rating, rewatch: movie.rewatch, review: movie.review || "", tags: movie.reviewTags || movie.tags, lbDiaryLink: movie.lbDiaryLink, location: movie.watchedLocation, diaryEntries: movie.diaryEntries, previousView: movie.previousView});
                      setDiaryExpanded(false);
                    }}>{
                      movie.watched && movie.watched.split("-").length > 3?
                                                                         movie.watched.substring(0, 10) : movie.watched
                    }</a>
                </span>
                <span className="loc">
                  {movie.watchedLocation? movie.watchedLocation: ""}
                </span>
              </div>
              {
                <span className="rating">
                  <div className={(movie.rating)? "ratingBox" : "year"}>
                    {movie.rating}
                  </div>
                </span>
              }
    </div>
    <div className="tags">
      {
        (collection && movie.collectionName)?
        <span className="collection"
              onClick={(e) => getCollection(movie.collectionId)}>
          {movie.collectionName}
        </span>
        : (movie.tags)?
        movie.tags.filter((tag) => tag !== "cinema").map((tag) => (
          <span className="tag"
                onClick={(e) => getTag(tag)}>
            {tag}
          </span>
        ))
        : <span></span>
      }
    </div>
    <div className="directors">
      {
        (movie.directors)?
        movie.directors.map((director) => (
          <span className="director"
                onClick={(e) => getDirected(director)}>
            {director}
          </span>
        )) : <span></span>
      }
    </div>
    <div className="available">
      {
        (movie.available)?
        movie.available.map((prov) => (
          <span>
            <img className="provider" src={getIcon(prov)}
            />
          </span>
        ))
        : <span></span>
      }
    </div>
    <div className="runtimeRewatch">
      <span className="runtime">
        {movie.runtime}min
      </span>
      {movie.views !== undefined && (movie.views > 0 || movie.previousView) &&
        <span className="views" onClick={(e) => {
          e.stopPropagation();
          setOpenDiaryPopup(openDiaryPopup === movie.id ? null : movie.id);
        }}>
          <img src={viewsImg} className="watchedImg"
          />
          <span className="floatingNumber">
            {movie.views}{movie.previousView? "+" : ""}
          </span>
          {movie.diaryEntries && movie.diaryEntries.length > 0 &&
            <div className={`diaryPopup${openDiaryPopup === movie.id ? ' diaryPopupOpen' : ''}`}>
              {[...movie.diaryEntries].reverse().map((entry, idx) => (
                <div className="diaryPopupEntry" key={idx}>
                  <span className="diaryPopupDate">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenReview({title: movie.title, year: movie.year, date: entry.date.substring(0, 10), rating: entry.rating, rewatch: entry.rewatch, review: entry.review || "", tags: entry.tags, lbDiaryLink: entry.entryURL, location: entry.location, diaryEntries: movie.diaryEntries});
                      setDiaryExpanded(false);
                    }}>{entry.date.split("-").length > 3 ? entry.date.substring(0, 10) : entry.date}</a>
                  </span>
                  <span className="diaryPopupRating">{entry.rating}</span>
                  <span className="diaryPopupLocation">{entry.location}</span>
                  {entry.tags && entry.tags.includes("cinema") && <img src={cinemaImg} className="diaryPopupCinema" alt="cinema" />}
                </div>
              ))}
            </div>
          }
        </span>
      }
      {movie.watchlist &&
        <span className="rewatch">
          <img src={watchlistImg} />
        </span>
      }
      {(movie.rewatch || (movie.tags && movie.tags.includes("cinema"))) && movie.views === undefined &&
        <span className="rewatch">
          {movie.rewatch && <img src={rewatchImg} />}
          {movie.tags && movie.tags.includes("cinema") && <img src={cinemaImg} className="cardCinema" alt="cinema" />}
        </span>
      }
    </div>
    </div>}
    </div>
      ))}
      {openReview && (
        <div className="reviewOverlay" onClick={() => setOpenReview(null)}>
          <div className="reviewModal" onClick={(e) => e.stopPropagation()}>
            <div className="reviewModalHeader">
              <div className="reviewModalHeaderContent">
                <div className="reviewModalTitleLine">
                  <span className="reviewModalFilmTitle">{openReview.title}</span>
                  {openReview.year && <span className="reviewModalYear">{openReview.year}</span>}
                </div>
                <div className="reviewModalWatchedRow">
                  <span className="reviewModalWatched">
                    {(openReview.previousView || (openReview.diaryEntries && openReview.diaryEntries[0]?.date.substring(0, 10) !== openReview.date)) ? "Rewatched" : "Watched"} {openReview.lbDiaryLink ? <a href={openReview.lbDiaryLink}>{openReview.date}</a> : openReview.date}
                  </span>
                  {openReview.rating && <span className="reviewModalRating">{openReview.rating}</span>}
                </div>
                {openReview.location && <span className="reviewModalLocation">{openReview.location}</span>}
              </div>
              <button className="reviewModalClose" onClick={() => setOpenReview(null)}>×</button>
            </div>
            {openReview.tags && openReview.tags.length > 0 && (
              <div className="reviewModalTags">
                {openReview.tags.map((tag, i) => (
                  <span className="tag" key={i}>{tag}</span>
                ))}
              </div>
            )}
            {openReview.diaryEntries && openReview.diaryEntries.filter(e => e.date.substring(0, 10) !== openReview.date).length > 0 && (
              <div className="reviewModalDiary">
                <div className="reviewModalDiaryToggle" onClick={() => setDiaryExpanded(!diaryExpanded)}>
                  {diaryExpanded ? "▾" : "▸"} Other entries
                </div>
                {diaryExpanded && (
                  <div className="reviewModalDiaryEntries">
                    {[...openReview.diaryEntries].reverse().filter(e => e.date.substring(0, 10) !== openReview.date).map((entry, idx) => (
                      <div className="diaryPopupEntry" key={idx}>
                        <span className="diaryPopupPA">{entry.date.substring(0, 10) < openReview.date ? "[p]" : "[a]"}</span>
                        <span className="diaryPopupDate">
                          <a href="#" onClick={(e) => {
                            e.preventDefault();
                            setOpenReview({...openReview, date: entry.date.substring(0, 10), rating: entry.rating, rewatch: entry.rewatch, review: entry.review || "", tags: entry.tags, lbDiaryLink: entry.entryURL, location: entry.location});
                            setDiaryExpanded(false);
                          }}>{entry.date.split("-").length > 3 ? entry.date.substring(0, 10) : entry.date}</a>
                        </span>
                        <span className="diaryPopupRating">{entry.rating}</span>
                        <span className="diaryPopupLocation">{entry.location}</span>
                        {entry.tags && entry.tags.includes("cinema") && <img src={cinemaImg} className="diaryPopupCinema" alt="cinema" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="reviewModalBody" dangerouslySetInnerHTML={openReview.review ? {__html: openReview.review} : undefined} />
          </div>
        </div>
      )}
    </div>
  );
};
