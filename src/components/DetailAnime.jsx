import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAnimeId } from "../store";
import "../assets/css/AnimeDetail.css"; // Ensure this path is correct
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faList } from "@fortawesome/free-solid-svg-icons";
import DetailSkeleton from "./DetailSkeleton";
import { App } from "@capacitor/app";

const removeWordFromTitle = (title) => {
  return title.replace(/nonton anime/gi, "").trim();
};

const DetailAnime = () => {
  const { id } = useParams();
  const [animeDetails, setAnimeDetails] = useState(null);
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [isDescending, setIsDescending] = useState(true); // State for sorting order
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const idAnime = id; // Ensure idAnime is correct

  // Scale state
  const [scale, setScale] = useState(1);

  // Handle scroll effect
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const scaleFactor = Math.max(1.1, 1 + scrollPosition / 600); // Adjust scaling factor
    setScale(scaleFactor);
  };

  // BACK Button
  useEffect(() => {
    const handleBackButton = () => {
      // Navigate back to the previous page
      navigate(-1);
    };

    // Listen to the back button event
    const removeListener = App.addListener("backButton", handleBackButton);

    // Cleanup listener on unmount
    return () => {
      removeListener.remove();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      try {
        const { data } = await axios.get(
          `https://nimeku-api.vercel.app/api/anime-details/${id}`
        );
        setAnimeDetails(data);
      } catch (error) {
        console.error("Error fetching anime details:", error);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  // Save idAnime to Redux store
  useEffect(() => {
    dispatch(setAnimeId(idAnime));
  }, [idAnime, dispatch]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  

  // Fetch search results based on anime title
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (animeDetails && animeDetails.title) {
        // Function to fetch search results for a given query
        const fetchResults = async (query) => {
          try {
            const { data } = await axios.get(
              `https://nimeku-api.vercel.app/api/search/${encodeURIComponent(query)}`
            );

            // Exclude the current anime from the search results
            const filteredResults = data.filter(
              (result) => result.title !== animeDetails.title
            );

            return filteredResults;
          } catch (error) {
            console.error("Error fetching search results:", error);
            return [];
          }
        };

        // Split title into words
        const titleWords = animeDetails.title.split(" ");
        let searchResults = [];

        // Try with 3 words first
        if (titleWords.length >= 3) {
          searchResults = await fetchResults(titleWords.slice(0, 3).join(" "));
        }

        // If no results, try with 2 words
        if (searchResults.length === 0 && titleWords.length > 1) {
          searchResults = await fetchResults(titleWords.slice(0, 2).join(" "));
        }

        // Optionally, try with 1 word (if needed)
        if (searchResults.length === 0 && titleWords.length > 0) {
          searchResults = await fetchResults(titleWords[0]);
        }

        setSearchResults(searchResults);
      }
    };

    fetchSearchResults();
  }, [animeDetails]);
  
  
  const limitTitleWords = (title, wordLimit = 6) => {
    const words = title.split(" ");
    return words.length > wordLimit ? `${words.slice(0, wordLimit).join(" ")}...` : title;
  };
  if (!animeDetails) {
    return (
      <div className="">
        <DetailSkeleton />
      </div>
    );
  }

  const sortedEpisodes = [...animeDetails.episodes].sort((a, b) => {
    const numberA = parseInt(a.number, 10);
    const numberB = parseInt(b.number, 10);
    return isDescending ? numberB - numberA : numberA - numberB;
  });

  const totalEpisodes = animeDetails.episodes.length;
  const releaseDate = animeDetails.details["Tanggal Rilis"];

  return (
    <div className="detail-container">
      <div className="parallax-container">
        <img
          className="parallax-image"
          style={{ transform: `scale(${scale})` }} // Apply scale transformation
          src={`https://nimeku-api.vercel.app/api/wever?url=${encodeURIComponent(
            animeDetails.image
          )}`}
          alt={animeDetails.title}
        />
        <div className="parallax-overlay"></div>
      </div>
      <div className="detail-body p-2">
        <p className="mb-2 text-white fs-2">
          {removeWordFromTitle(animeDetails.title)}
        </p>

        <div className="container d-flex gap-1">
          {animeDetails.rating && (
            <p className="fs-6 text-white rating">
              <FontAwesomeIcon icon={faStar} style={{ color: "#FFD369" }} />{" "}
              {animeDetails.rating}
            </p>
          )}
          <p className="text-white details-text">
            {animeDetails.details.Studio}
          </p>
          <p className="text-white details-text">{animeDetails.details.Type}</p>
          <p className="text-white details-text">{releaseDate}</p>
        </div>
        <div className="row d-flex justify-content-center">
          {animeDetails.tags.map((tag, index) => (
            <div
              key={index}
              className="col-3 col-md-2 col-lg-2 genre-col m-1 p-1 fw-bold d-flex justify-content-center text-white"
            >
              <Link
                to={`/genre/${tag}`}
                className="card-text text-decoration-none text-center text-white"
              >
                {tag}
              </Link>
            </div>
          ))}
        </div>
        {/* <p className="card-title fs-2 fw-bold text-white">Synopsis</p>
        <p className="card-text text-white fs-6"> {animeDetails.description.length >= 61
            ? `${animeDetails.description.substring(0, 610)}...`
            : animeDetails.description}</p> */}
             {/* Display search results */}
             <div>
      {/* Check if searchResults has data */}
      {searchResults.length > 0 && (
        <>
          <p className="card-title fs-5 mt-4 text-white">Related Anime</p>
          <div className="related-anime-list">
            {searchResults
              .filter((result) => result.title !== animeDetails.title) // Exclude current anime title
              .map((result) => (
                <div key={result.url} className="related-anime-item">
                  <Link
                    to={`/anime/${result.link.split('/')[4]}`}
                    className="related-anime-link text-decoration-none"
                  >
                    <div
                      className="related-anime-image"
                      style={{ backgroundImage: `url(${result.imageUrl})` }}
                    ></div>
                    <div className="related-anime-title-container">
                      <p className="related-anime-title">{limitTitleWords(result.title)}</p>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </>
      )}
    </div>

        <p className="card-title fs-5 mt-4 text-white">Episodes ({totalEpisodes})</p>
        <button
          className="sort-button mb-3 mt-3 text-white p-2"
          onClick={() => setIsDescending(!isDescending)}
        >
          <FontAwesomeIcon icon={faList} />
        </button>
        <div className="episode-list-card">
          <div className="episode-list-container">
            {sortedEpisodes.map((episode) => {
              // Determine the correct path by removing the base URL
              const updatedUrl = episode.url.includes("oploverz.ch")
                ? episode.url.replace("https://oploverz.ch/", "")
                : episode.url.includes("gojonime.com")
                ? episode.url.replace("https://gojonime.com/", "")
                : episode.url.includes("oploverz.media")
                ? episode.url.replace("https://oploverz.media/", "")
                : episode.url;

              return (
                <div key={episode.url} className="col-12 col-md-6 episode-col">
                  <Link
                    to={`/episode/${updatedUrl}`}
                    className="episode-link text-decoration-none"
                  >
                    <div className="episode-card-body">
                      <strong>Episode {episode.number}</strong>
                      <br />
                      <small className="text-white">({episode.date})</small>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

       

      </div>
    </div>
  );
};

export default DetailAnime;
