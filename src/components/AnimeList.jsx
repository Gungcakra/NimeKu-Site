import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AnimeSkeleton from './AnimeSkeleton'; // Import the AnimeSkeleton component
import "../assets/css/AnimeList.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Dialog from './Dialog';
import { Spinner } from 'react-bootstrap';
// Function to truncate the anime title


const AnimeList = () => {
  const [animeList, setAnimeList] = useState([]);
  const [newAnime, setNewAnime] = useState([]);
  const [recommendedAnime, setRecommendedAnime] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFixed, setIsFixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTimestamp, setDialogTimestamp] = useState(0);
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [loadingNewAnime, setLoadingNewAnime] = useState(true); // State for loading new anime
  const [loadingGenre, setLoadingGenre] = useState(true); // State for loading new anime
  const userId = localStorage.getItem('userId') || Date.now().toString();
  localStorage.setItem('userId', userId);
  // Fetch anime list from the API
  useEffect(() => {
    const fetchAnimeList = async () => {
      try {
        const { data } = await axios.get('https://nimeku-api.vercel.app/api/completed');
        setAnimeList(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeList();
  }, []);

  useEffect(() => {
    const fetchRecommendedAnime = async () => {
      try {
        const { data } = await axios.get('https://nimeku-api.vercel.app/api/recommend');
        setRecommendedAnime(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedAnime();
  }, []);

  useEffect(() => {
    const fetchNewAnime = async () => {
      try {
        const { data } = await axios.get('https://nimeku-api.vercel.app/api/new');
        setNewAnime(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingNewAnime(false); // Update the loading state for new anime
      }
    };

    fetchNewAnime();
  }, []);

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        const { data } = await axios.get('https://nimeku-api.vercel.app/api/data');
        setGenres(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingNewAnime(false); // Update the loading state for new anime
      }
    };

    fetchGenre();
  }, []);
  // const genreCount = genres.genres.length;
  const truncateTitle = (title, maxWords) => {
    const words = title.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return title;
  };


  const truncateEpisode = (episodeNumber, maxWords) => {
    // Regex to remove the episode number and subtitle details
    const cleanedTitle = episodeNumber.replace('- END', '').replace('Ep','Episode').trim();
    
    const words = cleanedTitle.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '';
    }
    return cleanedTitle;
  };
  const truncateRecEpisode = (episodeNumber, maxWords) => {
    // Regex to remove the episode number and subtitle details
    const cleanedTitle = episodeNumber.replace('END', '').trim();
    
    const words = cleanedTitle.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '';
    }
    return cleanedTitle;
  };
  const truncateRecTitle = (title, maxWords) => {
    // Regex to remove the episode number and subtitle details
    const cleanedTitle = title.replace(/(\s*\d+.*|subtitle\s*indonesia\s*$)/i, '').trim();
    
    const words = cleanedTitle.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '';
    }
    return cleanedTitle;
  };



  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Check if the scroll position is greater than 100px to fix the search bar
      if (scrollTop > 100) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  useEffect(() => {
    const fetchDialogStatus = async () => {
      try {
        const { data } = await axios.get('https://nimeku-api.vercel.app/api/dialog-status');
        console.log('API Response:', data); // Debug: Check the API response
        const dialogClosed = localStorage.getItem(`dialogClosed_${userId}`);
        console.log('Dialog Closed:', dialogClosed); // Debug: Check localStorage value
        console.log('Dialog Show:', data.showDialog); // Debug: Check dialog show status
        const localTimestamp = localStorage.getItem('dialogTimestamp');
        console.log('Local Timestamp:', localTimestamp); // Debug: Check localStorage timestamp
        console.log(data.lastUpdated)
        if (dialogClosed && data.showDialog) {
          if (!localTimestamp || data.lastUpdated > localTimestamp) {
            setDialogContent(data.dialogContent);
            setDialogTimestamp(data.lastUpdated);
            setShowDialog(true);
            localStorage.setItem('dialogTimestamp', data.lastUpdated);
            console.log("AAAAAAAAAAAAAAAAAAAAA")
          } else{
            setShowDialog(false);
            handleCloseDialog()
            console.log("PPPPPPPPPPPPPPPPPPPPP")
          }
        }
      } catch (error) {
        console.error('Error fetching dialog status:', error);
      }
    };
  
    fetchDialogStatus();
  }, [userId]);
  
  

  const handleCloseDialog = () => {
    localStorage.setItem(`dialogClosed_${userId}`, 'true');
    setShowDialog(false);
  };

  const resetDialogStatus = async () => {
    try {
      await axios.post('https://nimeku-api.vercel.app/api/dialog-status/reset');
      localStorage.removeItem(`dialogClosed_${userId}`);
      localStorage.removeItem('dialogTimestamp');
      setShowDialog(true);
    } catch (error) {
      console.error('Error resetting dialog status:', error);
    }
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search/${encodeURIComponent(searchQuery)}`);
  };
  
  const genreLists = genres.genres
  return (
    <>
      <div id='bg-animelist' className="container-fluid">
     <div className={`search-bar ${isFixed ? 'fixed' : ''}`}>
     <form onSubmit={handleSearch}>

     
      <div className="input-group d-flex justify-content-center align-items-center">
        <input
          type="text"
          className="form-control bg-dark text-light rounded"
          placeholder="Search..."
          aria-label="Search"
          aria-describedby="search-addon"
          value={searchQuery}
            onChange={handleInputChange}
        />
        <div className="input-group-append">
        <button className="btn btn-dark text-white" type="submit" id="search-addon">
              <FontAwesomeIcon icon={faSearch} className='icon-search' />
            </button>
        </div>
      </div>
      </form>
    </div>
      
        <p className="text-start text-white fs-2 pt-3"><b>New</b> Anime Update</p>
        <div id='container-animelist' className="row d-flex justify-content-center align-items-center">
          {loadingNewAnime ? (
            // Render skeleton loaders while loading new anime
              <div className='container d-flex justify-content-center align-items-center' style={{ width:'100%', height:'200px' }}>
              <Spinner animation="border" role="status" variant="danger">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
             
              </div>
            )
           : (
            // Render the actual new anime list
            newAnime.map((anime, index) => (
              <Link
                id="card"
                className="col-sm-2 rounded d-flex flex-column justify-content-start align-items-center p-0"
                key={index}
                style={{ width: '30%', height: '200px', margin: '5px', overflow: 'hidden' }}
                to={`/anime/${anime.url.split('/')[4]}`}
              >
                <div
                  className="row card-newanime"
                  style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: ` url(${anime.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
                <div className="episode-text-container">
                      <p className="fw-bold episode-texts rounded ">{truncateEpisode(anime.episodeNumber)}</p>
                    </div>
                <div className="card-body d-flex flex-column align-items-center">
                  <p
                    className="newanime-title text-center text-decoration-none text-white"
                  >
                    {truncateTitle(anime.title, 3)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
        <p className="text-start text-white mt-4 fs-2"><b>Popular</b> Anime Today</p>
          {/* <button onClick={resetDialogStatus}>Reset Button</button> */}

        <div className="recommended-container">
  <div className="recommended-card-container">
    {recommendedAnime.map((rec, index) => (
      <Link id="card" className="recommended-anime-card" key={index}
      to={`/anime/${rec.href.split('/')[4]}`}
      >
        <div
          className="recommended-image"
          style={{
            width: "100%",
            height: "150px",
            backgroundImage: `url(${rec.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          data-index={`#${index + 1}`}
          // data-episode={rec.status}
        ></div>
        <div className="card-body d-flex flex-column align-items-center">
          <p className="recommend-title text-center text-decoration-none text-white">
            {truncateTitle(rec.title,3 )}
          </p>
        </div>
      </Link>
    ))}
  </div>
</div>
        {/* GENRE */}
        <p className="text-start text-white mt-4 fs-2"><b>Genre</b> List ({genreLists?.length})</p>
        <div className="container-genre">
  <div className="genre-row">
    {Array.isArray(genreLists) &&
      genreLists.map((gen, index) => (
        <div key={index} className="genre-item">
          <Link
            to={`/genre/${gen}`}
            className="text-white text-center genre-text text-decoration-none"
          >
            {gen}
          </Link>
        </div>
      ))}
  </div>
</div>

        <p className="text-start text-white mt-4 fs-2"><b>Completed</b> Anime</p>
        <div id='container-animelist' className="row d-flex justify-content-center align-items-center">
          {loading ? (
            // Render skeleton loaders while loading other anime
            Array.from({ length: 25 }).map((_, index) => (
              <div className="col-sm-2" key={index} style={{ width: '30%', height: '150px', marginTop: '5px' }}>
                <AnimeSkeleton />
              </div>
            ))
          ) : (
            // Render the actual anime list
            animeList.map((anime, index) => (
              <Link
                id="card"
                className="col-sm-2 rounded d-flex flex-column justify-content-start align-items-center p-0"
                key={index}
                style={{ width: '30%', height: '200px', margin: '5px', overflow: 'hidden' }}
                to={`/anime/${anime.href.split('/')[4]}`}
              >
                <div
                  className="row"
                  style={{
                    width: '100%',
                    height: '150px',
                    backgroundImage: ` url(${anime.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                ></div>
                <div className="card-body d-flex flex-column align-items-center">
                  <p
                    className="title-complete text-center text-decoration-none text-white"
                  >
                    {truncateTitle(anime.title, 3)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
       
        {/* <Dialog show={showDialog} onClose={handleCloseDialog}>
          <div dangerouslySetInnerHTML={{ __html: dialogContent }} />
        </Dialog> */}
      </div>
    </>
  );
};

export default AnimeList;
