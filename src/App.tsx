// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';
import CelebratePage from './routes/CelebratePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/celebrate" element={<CelebratePage />} />
      </Routes>
    </Router>
  );
};

export default App;
