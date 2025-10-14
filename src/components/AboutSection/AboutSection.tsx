// src/components/AboutSection/AboutSection.tsx

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../starter-styles/starter-styles.css';
import confetti from 'canvas-confetti';
import { useBadges } from '../../context/BadgeContext';
import { useSectionObserver } from '../../hooks/useSectionObserver';

const LONG_PRESS_DURATION = 800; // milliseconds

const AboutSection: React.FC = () => {
    useSectionObserver('about-section');

    const { registerCelebration } = useBadges();
    const navigate = useNavigate();
    const longPressTimer = useRef<number | null>(null);
    const isLongPress = useRef(false);

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

      const handleCelebrateMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        isLongPress.current = false;
        
        longPressTimer.current = window.setTimeout(() => {
          isLongPress.current = true;
          navigate('/celebrate');
        }, LONG_PRESS_DURATION);
      };

      const handleCelebrateMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (longPressTimer.current !== null) {
          window.clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // Only celebrate if it was a short press
        if (!isLongPress.current) {
          registerCelebration();
          triggerConfetti(event);
        }
      };

      const handleCelebrateMouseLeave = () => {
        if (longPressTimer.current !== null) {
          window.clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isLongPress.current = false;
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
                <h2 className="text-2xl font-bold">About Me</h2>
                <br/>
                <p>
                    Hi, I'm Koray. I'm a software engineer at Roblox on the Infrastructure {'>'} Observability team. I also run <a href="https://www.birdflop.com/">Birdflop</a>, the only 501(c)(3) nonprofit that's aiming to expand interest in technology and computer science through affordable and accessible virtual server hosting. I graduated from Yale with a B.S. in computer science and a passion for machine learning and open-source software. I also love mulling cider and{" "}
                    <span 
                        className="highlighted-text"
                        onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}>
                        over the best zeugmas
                    </span>. This website has a few easter eggs. Can you find them all?
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
                </p>
                <br/>
                <div className="button-container">
                    <a href="#projects-section" className="btn-large">View Projects</a>
                    {/* <a href="/assets/private/Koray_Akduman_Resume_PUBLIC.pdf" target="_blank" className="btn-large">View Resume</a> */}
                    <button 
                        className="btn-large" 
                        onMouseDown={handleCelebrateMouseDown}
                        onMouseUp={handleCelebrateMouseUp}
                        onMouseLeave={handleCelebrateMouseLeave}
                        onTouchStart={handleCelebrateMouseDown as any}
                        onTouchEnd={handleCelebrateMouseUp as any}
                    >
                        Celebrate
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
}

export default AboutSection;
