// src/components/ProjectsSection/ProjectsSection.tsx

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
                </div>
                <p>
                    <i>August 2020 - Present</i>
                    <div className="button-container">
                        <a href="https://birdflop.com/" target="_blank" className="btn-small" rel="noreferrer">View Website</a>
                        <a href="https://github.com/birdflop/website" target="_blank" className="btn-small" rel="noreferrer">View Website GitHub</a>
                    </div>
                    Created the world's only 501(c)(3) nonprofit virtual game server host aiming to promote interest in technology and computer science. Used knowledge of Python, JavaScript, HTML/CSS/JS, Qwik, PHP, Linux/UNIX, Docker, and Java to perform software engineering and system administration tasks, linking ~10 hand-built bare metal servers hosting applications and custom resources cumulatively used by 250,000+ monthly users.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Character-based N-gram Model Predicting Language Groups and Evolution</h2>
                </div>
                <p>
                    <i>March 2024</i>
                    <div className="button-container">
                        <a href="https://github.com/kakduman/n-gram-language-classification/blob/main/results.ipynb" target="_blank" className="btn-small" rel="noreferrer">View Writeup & Codebase</a>
                    </div>
                    For a class paper, created the first proof-of-concept character-based n-gram approach that successfully predicts commonly recognized language families (e.g. "West Germanic," "Romance," etc.) in a completely unsupervised manner, using k-means clustering and Uniform Manifold Approximation and Projection (UMAP) to visualize the vectors. The model additionally demonstrates an ability to trace backwards in time to determine the evolution of language and is able to find relationships between different language groups.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Paper: Distinguishing features of long COVID identified through immune profiling</h2>
                </div>
                <p>
                    <i>Nature, September 2023</i>
                    <div className="button-container">
                        <a href="https://www.nature.com/articles/s41586-023-06651-y" target="_blank" className="btn-small" rel="noreferrer">View Paper</a>
                    </div>
                    In this paper, we conducted a cross-sectional study involving 275 individuals to investigate the biological features associated with long COVID (LC). We employed multidimensional immune phenotyping and unbiased machine learning methods to identify key biological differences in individuals with or without long COVID. Our findings revealed distinct immune profiles in LC patients, characterized by altered immune cell populations and elevated antibody responses to viral pathogens, providing insights into the underlying mechanisms of this condition. <br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Sir Stabby’s Perpetual Motion Machine</h2>
                </div>
                <p>
                    <i>December 2023</i>
                    <div className="button-container">
                        <a href="https://github.com/AddisonGoolsbee/sir-stabbys-torture-device" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                    </div>

                    As a class project, constructed an embedded system using Python & C++ featuring voice FFTs, two-way wireless communication, OpenAI APIs, ESP32 controllers, and servos.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2>Botflop</h2>
                </div>
                <p>
                    <i>January 2021 - July 2023</i>
                    <div className="button-container">
                        <a href="https://github.com/birdflop/botflop" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                    </div>
                    Led a team to create Botflop: an open-source Discord bot in JavaScript that analyzes timings delay reports to suggest mitigations for common Minecraft server issues. It also automatically uploads text files to a globally accessible bin. Botflop has helped 300,000+ users in 1,800+ Discord servers.<br/><br/>
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
                    <h2>Binflop</h2>
                </div>
                <p>
                    <i>February 2021 - July 2021</i>
                    <div className="button-container">
                        <a href="https://bin.birdflop.com" target="_blank" className="btn-small" rel="noreferrer">Try It Out</a>
                    </div>
    
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
                </div>
                <p>
                    <i>February 2021 - March 2021</i>
                    <div className="button-container">
                        <a href="https://birdflop.com/resources/rgb" target="_blank" className="btn-small" rel="noreferrer">Try It Out</a>
                        <a href="https://github.com/birdflop/website" target="_blank" className="btn-small" rel="noreferrer">View GitHub</a>
                    </div>
                    Developed a website with 30,000+ monthly users that calculates and formats hex code gradients for Minecraft. <br/><br/>
                </p>
            </div>

        </div>
    </section>

  );
}

export default ProjectsSection;
