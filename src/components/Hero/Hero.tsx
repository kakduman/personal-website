// src/components/Hero/Hero.tsx

import React from 'react';
import '../starter-styles/starter-styles.css';
import { useSectionObserver } from '../../hooks/useSectionObserver';

const Hero: React.FC = () => {
  useSectionObserver('hero-section');

  return (
    <section id="hero-section" className="header-centered">
        <div className="container">
            <h1>Koray Akduman</h1>
            <p>Student, Software Engineer, System Administrator</p>
        </div>
    </section>
  );
}

export default Hero;
