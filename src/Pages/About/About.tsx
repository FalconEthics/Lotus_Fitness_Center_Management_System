import { motion } from 'framer-motion';
import {
    HiArrowTopRightOnSquare,
    HiExclamationTriangle,
    HiShieldCheck,
    HiDevicePhoneMobile,
    HiChartBar,
    HiUsers,
    HiCalendarDays,
    HiTableCells,
    HiCircleStack,
    HiBolt,
    HiBeaker,
    HiGlobeAlt
} from 'react-icons/hi2';
import {
    FaGithub,
    FaInstagram,
    FaLinkedin
} from 'react-icons/fa';

const About = () => {
    const socialLinks = [
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/soumik-das-profile/',
            icon: FaLinkedin,
            color: 'hover:text-blue-600'
        },
        {
            name: 'Portfolio',
            url: 'https://mrsoumikdas.com/',
            icon: HiGlobeAlt,
            color: 'hover:text-green-600'
        },
        {
            name: 'Instagram',
            url: 'https://www.instagram.com/account.soumik.das/',
            icon: FaInstagram,
            color: 'hover:text-pink-600'
        },
        {
            name: 'GitHub',
            url: 'https://github.com/FalconEthics',
            icon: FaGithub,
            color: 'hover:text-gray-600'
        }
    ];

    const keyFeatures = [
        { icon: HiShieldCheck, title: 'Advanced Security', desc: 'PBKDF2 hashing & AES encryption' },
        { icon: HiDevicePhoneMobile, title: 'PWA Support', desc: 'Install as mobile/desktop app' },
        { icon: HiChartBar, title: 'Real-time Analytics', desc: 'Interactive charts & reporting' },
        { icon: HiUsers, title: 'Member Management', desc: 'Complete lifecycle tracking' },
        { icon: HiCalendarDays, title: 'Class Scheduling', desc: 'Drag-and-drop calendar' },
        { icon: HiTableCells, title: 'Excel Export', desc: '9 professional report types' },
        { icon: HiCircleStack, title: 'Smart Storage', desc: 'Quota monitoring & optimization' },
        { icon: HiBolt, title: 'Performance', desc: 'React 18 & SWC compilation' },
        { icon: HiBeaker, title: 'Fully Tested', desc: 'Comprehensive test suite' }
    ];

    const techStack = [
        'React 18', 'TypeScript', 'Tailwind CSS', 'Vite + SWC',
        'Context API', 'Framer Motion', 'Recharts', 'React Router v7',
        'Date-fns', 'Lodash', 'Crypto-js', 'Vitest'
    ];

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex justify-center"
                        >
                            <img
                                src="/src/assets/logo.png"
                                alt="Lotus Fitness Logo"
                                className="w-20 h-20 rounded-2xl shadow-lg"
                            />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-primary">
                            Lotus Fitness Center Management System 2.0
                        </h1>
                        <p className="text-lg text-base-content/80 max-w-2xl mx-auto">
                            A comprehensive, secure, and offline-capable fitness center management system built with modern React technologies.
                        </p>
                    </div>

                    {/* Project Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="alert alert-warning"
                    >
                        <HiExclamationTriangle className="w-5 h-5" />
                        <div>
                            <h3 className="font-bold">Project Application Notice</h3>
                            <p className="text-sm">
                                This is a portfolio project application built for demonstration purposes.
                                Please do not enter any personal or sensitive information. Use the provided
                                demo data and default credentials for testing purposes only.
                            </p>
                        </div>
                    </motion.div>

                    {/* Key Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-center">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {keyFeatures.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                                    className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="card-body p-4">
                                        <feature.icon className="w-6 h-6 text-primary mb-2" />
                                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                                        <p className="text-xs text-base-content/70">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tech Stack */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-bold text-center">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {techStack.map((tech, index) => (
                                <motion.span
                                    key={tech}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                                    className="badge badge-primary badge-lg"
                                >
                                    {tech}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Version & Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="text-center space-y-4"
                    >
                        <div className="card bg-base-200 shadow-sm">
                            <div className="card-body py-4">
                                <h3 className="card-title justify-center text-lg">Project Links</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <a
                                        href="https://lotus-fitness-center-management-system.vercel.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm gap-2"
                                    >
                                        <HiArrowTopRightOnSquare className="w-4 h-4" />
                                        Live Demo
                                    </a>
                                    <a
                                        href="https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-sm gap-2"
                                    >
                                        <FaGithub className="w-4 h-4" />
                                        Source Code
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="text-center space-y-4"
                    >
                        <h2 className="text-2xl font-bold">Connect with Me</h2>
                        <div className="flex justify-center gap-6">
                            {socialLinks.map((link) => (
                                <motion.a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1 + socialLinks.indexOf(link) * 0.1, duration: 0.3 }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-base-200 transition-colors ${link.color}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <link.icon className="w-8 h-8" />
                                    <span className="text-sm font-medium">{link.name}</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Copyright */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="text-center pt-8 border-t border-base-300"
                    >
                        <p className="text-sm text-base-content/60">
                            Copyright © 2024 - Soumik Das. All Rights Reserved
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
