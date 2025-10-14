// src/routes/HomePage.tsx

import React from 'react';
import Header from '../components/Header/Header';
import AboutSection from '../components/AboutSection/AboutSection';
import ExperienceSection from '../components/ExperiencesSection/ExperiencesSection';
import ProjectsSection from '../components/ProjectsSection/ProjectsSection';
import Hero from '../components/Hero/Hero';
import BadgeOverlay from '../components/BadgeOverlay/BadgeOverlay';
import BadgeStats from '../components/BadgeStats/BadgeStats';
import Footer from '../components/Footer/Footer';
import '../components/starter-styles/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="App">
      <BadgeOverlay />
      <BadgeStats />
      <Header />
      <Hero />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <Footer />
    </div>
  );
}

export default HomePage;
