// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './routes/HomePage';
import CelebratePage from './routes/CelebratePage';
import VillagePage from './routes/VillagePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/celebrate" element={<CelebratePage />} />
        {/* v3 Phase 4-6: standalone while /celebrate is still being finished */}
        <Route path="/village" element={<VillagePage />} />
      </Routes>
    </Router>
  );
};

export default App;
