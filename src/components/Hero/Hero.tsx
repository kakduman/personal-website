// src/components/Hero/Hero.tsx

import React from 'react';
import '../starter-styles/starter-styles.css';

const Hero: React.FC = () => {
  return (
    <div className="header-centered">
        <div className="container">
            <h1>Koray Akduman</h1>
            <p>Student, Software Engineer, System Administrator</p>
        </div>
    </div>
  );
}

export default Hero;
