import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AnimeList from './components/AnimeList';
import DetailAnime from './components/DetailAnime';
import Episode from './components/Episode';
import BottomNavBar from './components/BottomNavBar'; // Import the BottomNavBar
import 'bootstrap/dist/css/bootstrap.min.css';
import Jadwal from './components/Jadwal';
import SearchResults from './components/SearchResult';
import History from './components/History';
import GenreResults from './components/GenreResult';
import './assets/css/App.css'
const App = () => {
  const location = useLocation();
  
  // Determine if BottomNavBar should be shown
  const shouldShowBottomNavBar = ['/', '/jadwal', '/history', '/profile'].includes(location.pathname);

  return (
 
    <div id='app' style={{ paddingBottom: shouldShowBottomNavBar ? '60px' :  '0px'}}>
      <Routes>
        <Route path="/" element={<AnimeList />} />
        <Route path="/jadwal" element={<Jadwal />} />
        <Route path="/anime/:id" element={<DetailAnime />} />
        <Route path="/episode/:episodeId" element={<Episode />} />
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/genre/:genreId" element={<GenreResults />} />
        <Route path="/history" element={<History />}/>
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Routes>
      {shouldShowBottomNavBar && <BottomNavBar />}
    </div>
  );
};

// Wrap App in Router since we use useLocation
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
