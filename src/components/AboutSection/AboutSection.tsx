import React from 'react';
import '../starter-styles/starter-styles.css';

function AboutSection() {
  return (
    <section id="about-section" className="about-me">
        <div className="container about-container">
            <div className="profile-image">
                <img src="/assets/selfie.png" alt="Koray Akduman" />
            </div>
            <div className="about-text">
                <h2>About Me</h2>
                <br/>
                <p>Hi, I'm Koray. I'm a junior at Yale majoring in Computer Science. I also run Birdflop, the only 501(c)3 nonprofit Minecraft server host designed to foment interest in computer science and technology. I'm passionate about machine learning, open-source software, and hiking. I also love mulling cider and over the best zeugmas (pun intended)!
                    <br/>
                    <br/>
                    Most recently, I started working on my personal website (on December 24). There's lots to come...</p>
                <br/>
                <div>
                    <a href="#projects-section" className="btn-large">View Projects</a>
                    <a href="/assets/Koray_Akduman_Resume_PUBLIC_2023-12.pdf" target="_blank" className="btn-large">View Resume</a>
                </div>
            </div>
        </div>
    </section>
  );
}

export default AboutSection;
