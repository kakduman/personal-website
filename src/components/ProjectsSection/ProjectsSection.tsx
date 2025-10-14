// src/components/ProjectsSection/ProjectsSection.tsx

import React from 'react';
import '../starter-styles/starter-styles.css';
import { useSectionObserver } from '../../hooks/useSectionObserver';
import { useBadges } from '../../context/BadgeContext';

const ProjectsSection: React.FC = () => {
    useSectionObserver('projects-section');
    const { registerProjectButtonClick } = useBadges();

    const handleProjectButtonClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const target = event.currentTarget;
        const id = target.dataset.badgeId;

        if (id) {
            registerProjectButtonClick(id);
        }
    };

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
                    <h2 className="text-2xl font-bold">Birdflop</h2>
                </div>
                <p>
                    <i>August 2020 - Present</i>
                    <div className="button-container">
                        <a href="https://birdflop.com/" target="_blank" className="btn-small" data-badge-id="birdflop-site" rel="noreferrer" onClick={handleProjectButtonClick}>View Website</a>
                        <a href="https://github.com/birdflop/web" target="_blank" className="btn-small" data-badge-id="birdflop-github" rel="noreferrer" onClick={handleProjectButtonClick}>View Website GitHub</a>
                    </div>
                    Created the world's only 501(c)(3) nonprofit virtual server host aiming to promote interest in technology and computer science. Used programming languages including Python, Javascript, HTML/CSS, Qwik, PHP, Java, and Go and tools including Docker, Kubernetes, Redis, Prometheus, and Grafana to perform software engineering and system administration tasks. Collectively manage over 1 TB of Memory, 100 TB of storage, and 1 THz of compute across 250 CPUs on bare metal Debian Linux servers to host applications and custom resources cumulatively used by 300,000+ monthly users providing around $50,000 in annual revenue.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Deep Learning-Enhanced 3D Modeling for Surgical Ergonomics</h2>
                </div>
                <p>
                    <i>May 2025</i>
                    <div className="button-container">
                        <a href="https://github.com/kakduman/modeling-surgical-ergonomics/blob/main/Final_Report.pdf" target="_blank" className="btn-small" data-badge-id="surgical-ergonomics" rel="noreferrer" onClick={handleProjectButtonClick}>View Paper &amp; Codebase</a>
                    </div>
                    For a senior project, designed a computer vision pipeline to model and evaluate surgeon posture in 3D from monocular RGB input. 
                    Used DepthAnything V2 for dense depth estimation, SegFormer for semantic segmentation, and a 
                    RANSAC-based calibration step to recover metric scale. Combined the calibrated depth with segmentation masks to 
                    reconstruct watertight meshes via the Ball-Pivoting Algorithm and quantified posture through curvature-based analysis using Trimesh. 
                    Achieved more accurate and detailed ergonomic metrics than prior sparse-sensor or keypoint-based methods, or similar methods without deep learning components.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Optimizing Traffic Flow Prediction Using Graph Neural Networks</h2>
                </div>
                <p>
                    <i>December 2024</i>
                    <div className="button-container">
                        <a href="https://github.com/kakduman/dcrnn-distance-correlation/blob/main/Yale_CPSC_483_583__Deep_Learning_on_Graph_Structured_Data__Fall_2024_.pdf" target="_blank" className="btn-small" data-badge-id="traffic-gnn" rel="noreferrer" onClick={handleProjectButtonClick}>View Paper & Codebase</a>
                    </div>
                    For a class paper, investigated spatial and temporal modeling of urban traffic using Graph Neural Networks. Compared Diffusion Convolutional Recurrent Neural Networks (DCRNNs) trained on distance-based versus correlation-based adjacency matrices to evaluate how graph construction impacts predictive accuracy on the METR-LA dataset. Results showed that distance-based graphs outperform correlation-based ones for temporal forecasting, but that correlation-based Graph Convolutional Networks (GCNs) capture useful spatial structure. Findings suggest hybrid approaches that combine physical and functional relationships may improve future traffic prediction models.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Character-based N-gram Model Predicting Language Groups and Evolution</h2>
                </div>
                <p>
                    <i>March 2024</i>
                    <div className="button-container">
                        <a href="https://github.com/kakduman/n-gram-language-classification/blob/main/results.ipynb" target="_blank" className="btn-small" data-badge-id="ngram-language" rel="noreferrer" onClick={handleProjectButtonClick}>View Writeup &amp; Codebase</a>
                    </div>
                    For a class paper, created the first proof-of-concept character-based n-gram approach that successfully predicts commonly recognized language families (e.g. "West Germanic," "Romance," etc.) in a completely unsupervised manner, using k-means clustering and Uniform Manifold Approximation and Projection (UMAP) to visualize the vectors. The model additionally demonstrates an ability to trace backwards in time to determine the evolution of language and is able to find relationships between different language groups.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Paper: Distinguishing features of long COVID identified through immune profiling</h2>
                </div>
                <p>
                    <i>Nature, September 2023</i>
                    <div className="button-container">
                        <a href="https://www.nature.com/articles/s41586-023-06651-y" target="_blank" className="btn-small" data-badge-id="long-covid" rel="noreferrer" onClick={handleProjectButtonClick}>View Paper</a>
                    </div>
                    In this paper, we conducted a cross-sectional study involving 275 individuals to investigate the biological features associated with long COVID (LC). We employed multidimensional immune phenotyping and unbiased machine learning methods to identify key biological differences in individuals with or without long COVID. Our findings revealed distinct immune profiles in LC patients, characterized by altered immune cell populations and elevated antibody responses to viral pathogens, providing insights into the underlying mechanisms of this condition. <br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Sir Stabby's Perpetual Motion Machine</h2>
                </div>
                <p>
                    <i>December 2023</i>
                    <div className="button-container">
                        <a href="https://github.com/AddisonGoolsbee/sir-stabbys-torture-device" target="_blank" className="btn-small" data-badge-id="sir-stabby" rel="noreferrer" onClick={handleProjectButtonClick}>View GitHub</a>
                    </div>

                    As a class project, constructed an embedded system using Python & C++ featuring voice FFTs, two-way wireless communication, OpenAI APIs, ESP32 controllers, and servos.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Botflop</h2>
                </div>
                <p>
                    <i>January 2021 - July 2023</i>
                    <div className="button-container">
                        <a href="https://github.com/birdflop/botflop" target="_blank" className="btn-small" data-badge-id="botflop" rel="noreferrer" onClick={handleProjectButtonClick}>View GitHub</a>
                    </div>
                    Led a team to create Botflop: an open-source Discord bot in JavaScript that analyzes timings delay reports to suggest mitigations for common Minecraft server issues. It also automatically uploads text files to a globally accessible bin. Botflop has helped 300,000+ users in 2,100+ Discord servers.<br/><br/>
                </p>
            </div>

            <div className="project-item">
                <br/>
                <div className="project-header">
                    <h2 className="text-2xl font-bold">Birdflop CDN</h2>
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
                    <h2 className="text-2xl font-bold">Binflop</h2>
                </div>
                <p>
                    <i>February 2021 - July 2021</i>
                    <div className="button-container">
                        <a href="https://bin.birdflop.com" target="_blank" className="btn-small" data-badge-id="binflop" rel="noreferrer" onClick={handleProjectButtonClick}>Try It Out</a>
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

        </div>
    </section>

  );
}

export default ProjectsSection;
