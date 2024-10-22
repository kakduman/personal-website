import React from 'react';
import '../starter-styles/starter-styles.css';
import '../starter-styles/experiences.css';

const ExperienceSection: React.FC = () => {
    const experiences = [
        {
            title: 'Executive & Technical Director',
            company: 'Birdflop, 501(c)(3)',
            duration: 'Oct. 2018 - Present',
        },
        {
            title: 'Undergraduate Researcher',
            company: 'Yale Department of Computer Science (van Dijk Lab)',
            duration: 'Mar. 2023 - Present',
        },
        {
            title: 'Software Engineer Intern (Infrastructure > Telemetry)',
            company: 'Roblox',
            duration: 'May 2024 - Aug. 2024',
        },
        {
            title: 'Undergraduate Learning Assistant (CPSC 365: Algorithms)',
            company: 'Yale University',
            duration: 'Feb. 2024 - May 2024',
        },
        {
            title: 'Research Fellow (Computational Biology > Machine Learning)',
            company: 'Rethink Priorities / Existential Risk Alliance (ERA)',
            duration: 'Jul 2023 - Aug 2023',
        },
        {
            title: 'Undergraduate Researcher',
            company: 'Yale School of Medicine (Ring Lab)',
            duration: 'Feb. 2022 - Mar. 2023',
        },
    ];

    return (
        <section id="experience-section" className="experience">
            <div className="container">
                <ol className="relative border-l border-gray-200 dark:border-gray-700 timeline">
                    {experiences.map((experience, index) => (
                        <li className="mb-10 ml-6 timeline-item" key={index}>
                            <span className="absolute flex items-center justify-center w-4 h-4 rounded-full -left-9 dark:bg-blue-400">
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-black">{experience.title}</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-400">{experience.duration}</time>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-500">{experience.company}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default ExperienceSection;
