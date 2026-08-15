import React, { useContext, useReducer, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import "./Catalog.css";
import imgPlaceholder from "./movie_placeholder.png";
import viewsImg from "./watched.png";
import rewatchImg from "./two-circular-arrows.png";
import watchlistImg from "./not-watched.png";
import downloadImg from "./download.png";
import cinemaImg from "./cinema.svg";
import { MoviesContext } from "../../services/context";
import { Movie, DiaryEntry, getMovies } from "../../services/movies.service";


// vertical (singleton) cards: font size when the title fits on one line, and
// the floor the auto-shrink is allowed to reach
const BASE_FS = 13;
const MIN_FS = 8;

export const Catalog = () => {
  const { master, movies, start, loading, selected, posterOnly, cardsPerRow,
          searchSingleton, setLoading, updateMovies, setSelected, setListName } =
        useContext(MoviesContext);
  const vertical = searchSingleton === "1" && !posterOnly;
  const infoRefs = useRef<HTMLDivElement[]>([]);
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

  // Lay one vertical card out with the year beside the title (or on the meta
  // row) and step its font down until the info block fits "height". The first
  // guess is linear in the overflow, so a card usually settles in a step or two.
  const fitInfo = (info: HTMLDivElement, height: number, inline: boolean) => {
    info.classList.toggle("inlineYear", inline);
    info.style.height = "auto";
    info.style.setProperty("--fs", BASE_FS + "px");
    if (info.offsetHeight <= height)
      return BASE_FS;
    let fs = Math.max(MIN_FS, BASE_FS * height / info.offsetHeight);
    info.style.setProperty("--fs", fs + "px");
    for (let i = 0; i < 24 && info.offsetHeight > height && fs > MIN_FS; i++)
    {
      fs = Math.max(MIN_FS, fs - 0.25);
      info.style.setProperty("--fs", fs + "px");
    }
    return fs;
  }

  // Every vertical card gets the height of a one-line-title card; the ones that
  // don't fit lose the inline year and, failing that, shrink their whole block.
  const fitCards = useCallback(() => {
    const infos = infoRefs.current.filter((i) => i && i.isConnected);
    if (infos.length === 0 || !infos[0].parentElement)
      return;
    // the height to hit: a throwaway card whose title, director and year all
    // sit on one line, so it doesn't depend on which films are on screen
    const probe = document.createElement("div");
    probe.className = "catalog__item__info catalog__item__info--vertical inlineYear";
    probe.style.cssText = "position:absolute;left:0;right:0;visibility:hidden;";
    probe.style.setProperty("--fs", BASE_FS + "px");
    probe.innerHTML =
      `<div class="titleRow"><span class="title">M</span>` +
      `<span class="year yearInline">(2000, US)</span></div>` +
      `<div class="metaRow"><span class="right"><span class="runtime">100min</span>` +
      `<span class="views"><img class="watchedImg" src="${viewsImg}" alt="" />` +
      `<span class="floatingNumber">1</span></span></span></div>` +
      `<div class="statRow"><span class="directors"><span class="director">M</span></span>` +
      `<span class="ratingPill">8</span></div>`;
    infos[0].parentElement.appendChild(probe);
    const height = probe.offsetHeight;
    probe.remove();
    infos.forEach((info) => {
      // prefer the year next to the title, but only if it costs no font size
      const inlineFs = fitInfo(info, height, true);
      if (inlineFs < BASE_FS && fitInfo(info, height, false) <= inlineFs)
        fitInfo(info, height, true);
      info.style.height = height + "px";
    });
  }, []);

  useLayoutEffect(() => {
    infoRefs.current = infoRefs.current.filter((i) => i && i.isConnected);
    if (!vertical)
      return;
    fitCards();
    if (document.fonts)
      document.fonts.ready.then(fitCards);
  }, [vertical, movies, cardsPerRow, containerWidth, loading, fitCards]);

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

  const cardWidthPercent = 100 / cardsPerRow;
  const cardWidth = containerWidth > 0 ? Math.floor(containerWidth / cardsPerRow) : 460;

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
    <div className="catalogContainer" id="catalog" ref={containerRef} style={{ "--card-width": `${cardWidthPercent}%`, "--card-scale": cardWidth / 460 } as React.CSSProperties}>
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
          {vertical && <div className="catalog__item__info catalog__item__info--vertical inlineYear"
                            ref={(el) => { if (el) infoRefs.current[idx] = el; }}>
            <div className="titleRow">
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
              <span className="year yearInline">
                ({movie.year}{movie.country? ", " + movie.country.toUpperCase() : ""})
              </span>
            </div>
            <div className="metaRow">
              <span className="year yearStacked">
                ({movie.year}{movie.country? ", " + movie.country.toUpperCase() : ""})
              </span>
              <span className="right">
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
              </span>
            </div>
            <div className="statRow">
              <span className="directors">
                {(movie.directors)?
                 movie.directors.map((director) => (
                   <span className="director"
                         onClick={(e) => getDirected(director)}>
                     {director}
                   </span>
                 )) : <span></span>}
              </span>
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
