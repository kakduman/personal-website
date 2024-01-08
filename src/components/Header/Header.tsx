import React from 'react';
import '../starter-styles/starter-styles.css';

const Header: React.FC = () => {
  return (
    <header>
        <div className="container header-content navigation">
            <h1 className="name">
                <a href="index.html">Koray Akduman</a>
            </h1>
                <a href="#projects-section">Projects</a>
                <a href="https://www.linkedin.com/in/korayakduman/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/linkedin-blue.svg" alt="LinkedIn" className="social-icon" />
                </a>
                <a href="https://github.com/kakduman" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/github-blue.svg" alt="GitHub" className="social-icon" />
                </a>
        </div>
    </header>
  );
}

export default Header;
