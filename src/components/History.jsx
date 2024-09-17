import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/History.css';

const History = () => {
  const [viewedEpisodes, setViewedEpisodes] = useState([]);

  useEffect(() => {
    // Load viewed episodes from local storage
    const historyData = localStorage.getItem('viewedEpisodes');
    if (historyData) {
      const episodes = JSON.parse(historyData);

      // Sort episodes by episode.time (newest first)
      episodes.sort((a, b) => new Date(b.time) - new Date(a.time));

      setViewedEpisodes(episodes);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to format the time
  const formatTime = (episodeTime) => {
    const now = new Date();
    const time = new Date(episodeTime);
    const timeDifference = now - time;

    const secondsAgo = Math.floor(timeDifference / 1000);
    const minutesAgo = Math.floor(timeDifference / (1000 * 60));
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (secondsAgo < 60) {
      return `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`;
    } else if (minutesAgo < 60) {
      return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`;
    } else if (hoursAgo < 24) {
      return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    } else if (daysAgo < 7) {
      return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    } else {
      return time.toLocaleDateString('en-GB'); // Format as "DD/MM/YYYY"
    }
  };

  // Function to delete an episode from history
  const deleteEpisode = (episodeIndex) => {
    // Create a new array without the deleted episode
    const updatedEpisodes = viewedEpisodes.filter((_, index) => index !== episodeIndex);
    // Update state
    setViewedEpisodes(updatedEpisodes);
    // Save updated episodes to local storage
    localStorage.setItem('viewedEpisodes', JSON.stringify(updatedEpisodes));
  };

  // Function to truncate the series title
  const truncateTitle = (seriesTitle) => {
    const maxLength = 30; // You can adjust the max length as needed
    if (seriesTitle.length > maxLength) {
      return seriesTitle.substring(0, maxLength) + '...';
    }
    return seriesTitle;
  };

  return (
    <div className="history-container">
      <p className='text-start text-white fs-2 fw-bold m-2'>History</p>
      <div className="container d-flex align-items-center">
        {viewedEpisodes.length > 0 ? (
          <div>
            {viewedEpisodes.map((episode, index) => (
              <div className='history-episode-list text-decoration-none text-white' key={index}>
                <div className="episode-card-left">
                  <img src={episode.seriesImageUrl} className='episode-image' alt={episode.seriesTitle} />
                </div>
                <div className="episode-card-right">
                  <Link to={`/episode/${episode.urlEpisode}`} className='text-decoration-none text-white'>
                    <p className='episode-title fw-bold m-2'>{truncateTitle(episode.seriesTitle)}</p>
                    <div className="history-detail m-2 d-flex flex-column">
                      <p className='episode-number fw-bold m-0'>Episode {episode.episodeNumber}</p>
                      <p className='m-0'>{formatTime(episode.time)}</p> {/* Format time here */}
                    </div>
                  </Link>
                  {/* <button onClick={() => deleteEpisode(index)} className="delete-button">
                    Delete
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-center text-white'>No episodes viewed yet.</p>
        )}
      </div>
    </div>
  );
};

export default History;
