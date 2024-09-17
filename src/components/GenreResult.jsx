import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AnimeSkeleton from './AnimeSkeleton';
import '../assets/css/GenreResult.css'; // Updated CSS import to match the new component name
import { App } from '@capacitor/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Function to truncate the anime title
const truncateTitle = (title, maxWords) => {
  const words = title.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return title;
};

const GenreResults = () => { // Renamed component
  const { genreId } = useParams(); // Get the search query from the URL\co parameters
  const [genreResults, setGenreResults] = useState([]); // Updated state variable name
  const [loadingGenre, setLoadingGenre] = useState(true); // Updated state variable name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenreResults = async () => { // Updated function name
      setLoadingGenre(true); // Updated state variable name
      try {
        const { data } = await axios.get(`https://nimeku-api.vercel.app/api/genre/${genreId}`);
        setGenreResults(data); // Updated state variable name
      } catch (error) {
        console.error('Error fetching genre data:', error); // Updated error message
      } finally {
        setLoadingGenre(false); // Updated state variable name
      }
    };

    fetchGenreResults(); // Updated function call
  }, [genreId]); // Re-run the effect when the query changes

  // BACK Button
  useEffect(() => {
    const handleBackButton = () => {
      // Navigate back to the previous page
      navigate(-1);
    };

    // Listen to the back button event
    const removeListener = App.addListener('backButton', handleBackButton);

    // Cleanup listener on unmount
    return () => {
      removeListener.remove();
    };
  }, [navigate]);

  return (
    <div id="bg-genre-result"> {/* Updated CSS ID */}
      {/* Back Button */}
      <div className="navigation-back ">

        <button
          onClick={() => navigate(-1)}
          className="btn btn-back btn-link"
          style={{ top: '10px', left: '10px' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
      </div>

      <p className="text-start text-white fs-1 pt-5">
        <b>Genre</b> Results for "{genreId}" {/* Updated label */}
      </p>
      <div
        id="container-genre-result" 
        className="d-flex justify-content-center"
      >
        {loadingGenre ? ( // Updated state variable
          Array.from({ length: 5 }).map((_, index) => (
            <div
              className=""
              key={index}
              style={{ width: '30%', height: '200px', marginTop: '5px' }}
            >
              <AnimeSkeleton />
            </div>
          ))
        ) : (
          genreResults.map((anime, index) => ( // Updated map function
            <Link
              id="card"
              className="col-sm-2 rounded d-flex flex-column justify-content-start align-items-center p-0"
              key={index}
              style={{ width: '30%', height: '200px', margin: '5px', overflow: 'hidden' }}
              to={`/anime/${anime.link.split('/')[4]}`}
            >
              <div
                className="row"
                style={{
                  width: '100%',
                  height: '150px',
                  backgroundImage: `url(${anime.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
              <div className="card-body d-flex flex-column align-items-center">
                <p className="genre-res-title text-center text-decoration-none text-white m- pb-2">
                  {truncateTitle(anime.title, 3)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default GenreResults; // Updated export
