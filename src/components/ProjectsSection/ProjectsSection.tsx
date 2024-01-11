import React from 'react';
import '../starter-styles/starter-styles.css';

const ProjectsSection: React.FC = () => {
    return (
    <section id="projects-section" className="projects">
        <div className="header-centered-reversed">
            <div className="container">
                <h1>Selected Projects</h1>
            </div>
        </div>
        <div className="container">

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Birdflop</h2>
                    <a href="https://birdflop.com/" target="_blank" className="btn-small" rel="noreferrer">View Website</a>
                    <a href="https://github.com/birdflop/website" target="_blank" className="btn-small" rel="noreferrer">View Website GitHub</a>
                </div>
                <p>
                    <i>August 2020 - Present</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
                    Created the world's only 501(c)3 nonprofit virtual game server host aiming to promote interest in technology and computer science. Used knowledge of Python, JavaScript, HTML/CSS, PHP, Linux/UNIX, Docker, and Java to perform software engineering and system administration tasks, linking ~10 hand-built bare metal servers hosting applications cumulatively used by 500,000+ users.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Botflop</h2>
                    <a href="https://github.com/birdflop/botflop" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                </div>
                <p>
                    <i>January 2021 - Present</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />

                    Lead a team to create Botflop: an open-source Discord bot in JavaScript that analyzes timings delay reports to suggest mitigations for common Minecraft server issues. It also automatically uploads text files to a globally accessible bin. Botflop has helped 300,000+ users in 1,800+ Discord servers.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Birdflop CDN</h2>
                </div>
                <p>
                    <i>July 2021 - Present</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />

                    Maintain a Content Distribution Network (CDN) for Birdflop to make locally hosted files available across the world.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Sir Stabby’s Perpetual Motion Machine</h2>
                    <a href="https://github.com/AddisonGoolsbee/sir-stabbys-torture-device" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                </div>
                <p>
                    <i>December 2023</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />

                    Constructed an embedded system using Python & C++ featuring voice FFTs, two-way wireless communication, OpenAI APIs, ESP32 controllers, and servos.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Binflop</h2>
                    <a href="https://bin.birdflop.com" target="_blank" className="btn-small" rel="noreferrer">Try It Out</a>
                </div>
                <p>
                    <i>February 2021 - July 2021</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
    
                    Created a fork of hastebin.com that patches bugs and implements improvements.                 
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
    
                    Bugs patched:<br/>
                    - Ctrl + A, Ctrl + C no longer copies button text nor line numbers.<br/>
                    - Line numbering is correct across all browsers, all zoom settings, and all uploaded files.
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
                    Improvements:<br/>
                    - Colors are more vibrant and visible.<br/>
                    - Functions box no longer conceals part of the first line.<br/>
                    - Added a toggleable "Hide IPs" button to hide all public IPs.<br/>
                    - Binflop links retain their content permanently.<br/>
                    - Expanded REST API.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>RGBirdflop</h2>
                    <a href="https://birdflop.com/resources/rgb" target="_blank" className="btn-small" rel="noreferrer">Try It Out</a>
                    <a href="https://github.com/birdflop/website" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                </div>
                <p>
                    <i>February 2021 - March 2021</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
                    Developed a website with 30,000+ monthly users that calculates and formats hex code gradients for Minecraft. <br/><br/>
                </p>
            </div>

            

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>FlockMarket (In-Progress)</h2>
                    <a href="https://github.com/kakduman/flock-market" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                </div>
                <p>
                    <i>October 2023 - Present</i>
                    <hr style={{ height: '1px', visibility: 'hidden' }} />
                    Currently developing Minecraft's most comprehensive economy and trading plugin. FlockMarket intends to implement a trading system for in-game items complete with a web UI and REST API to allow for algorithmic trading.<br/><br/>
                </p>
            </div>

        </div>
    </section>

  );
}

export default ProjectsSection;
