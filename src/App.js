// src/App.js
import React from 'react';
import Header from './components/Header/Header';
import AboutSection from './components/AboutSection/AboutSection';
import ProjectsSection from './components/ProjectsSection/ProjectsSection';
import Hero from './components/Hero/Hero';
// import other components as needed
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <AboutSection />
      <ProjectsSection />
    </div>
  );
}

export default App;
