import React, { useState } from 'react';
import '../starter-styles/starter-styles.css';
import confetti from 'canvas-confetti';

const AboutSection: React.FC = () => {

    const triggerConfetti = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = event;
    
        // Calculate position relative to the window
        const canvasX = clientX / window.innerWidth;
        const canvasY = clientY / window.innerHeight;
    
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: canvasX, y: canvasY },
          colors: ['#00cccc', '#0088cc', '#00cc66']
        });
      };
      

      const [showTooltip, setShowTooltip] = useState(false);
      const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
      const handleMouseMove = (event: React.MouseEvent) => {
          setMousePosition({
              x: event.clientX,
              y: event.clientY
          });
      };
  
      const handleMouseEnter = () => setShowTooltip(true);
      const handleMouseLeave = () => setShowTooltip(false);
    
  return (
    <section id="about-section" className="about-me">
        <div className="container about-container">
            <div className="profile-image">
                <img src="/assets/selfie.png" alt="Koray Akduman" />
            </div>
            <div className="about-text">
                <h2>About Me</h2>
                <br/>
                <p>Hi, I'm Koray. I'm a junior at Yale majoring in Computer Science. I also run <a href="https://www.birdflop.com/">Birdflop</a>, the only 501(c)(3) nonprofit that's aiming to expand interest in technology and computer science through affordable and accessible virtual server hosting. I'm passionate about machine learning and open-source software. I also love mulling cider and{" "}
                <span 
                        className="highlighted-text"
                        onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}>
                        over the best zeugmas
                    </span>.
                    {showTooltip && (
                        <div 
                            className="tooltip" 
                            style={{ 
                                left: `${mousePosition.x}px`, 
                                top: `${mousePosition.y - 30}px` /* Adjust the Y-offset to position the tooltip above the cursor */
                            }}>
                            <p><strong>Why's this funny?</strong></p>
                            <p>A zeugma ("ZOOG-muh") is a sentence that uses a word in two different meanings. In this case, "mulling" cider and "mulling over" zeugmas is in itself a zeugma, simultaneously making it a pun. Also, "zeugma" looks and sounds funny.</p>
                        </div>
                    )}
                    <br/>
                    <br/>
                    Most recently, I started working on my personal website (on December 24) using React with Typescript. There's lots to come...</p>
                <br/>
                <div>
                    <a href="#projects-section" className="btn-large">View Projects</a>
                    <a href="/assets/Koray_Akduman_Resume_PUBLIC_2024_1.pdf" target="_blank" className="btn-large">View Resume</a>
                    <button className="btn-large" onClick={(e) => triggerConfetti(e)}>Celebrate</button>
                </div>
            </div>
        </div>
    </section>
  );
}

export default AboutSection;
