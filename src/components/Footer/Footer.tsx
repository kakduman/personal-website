import React from 'react';
import { useSectionObserver } from '../../hooks/useSectionObserver';
import './Footer.css';

const Footer: React.FC = () => {
    useSectionObserver('footer-section');

    return (
        <footer id="footer-section" className="site-footer">
            <div className="container footer-content">
                <div className="footer-badge-message">
                    <span className="badge-emoji">🏆</span>
                    <p>Thanks for scrolling to the bottom of my website! Have a badge.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

