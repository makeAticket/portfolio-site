import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroAnimation from './HeroAnimation';
import { FiArrowDown } from 'react-icons/fi';
import NowPlaying from './NowPlaying';
import WeatherWidget from './WeatherWidget';

// Phrases with specially colored periods
const typewriterPhrases = [
  "innovative solutions",
  "AI-driven experiences",
  "data-powered products",
  "impactful technology",
];

export default function Hero() {
  const [displayText, setDisplayText] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);
  
  // Balanced typewriter effect - smooth but not too fast
  useEffect(() => {
    const handleTyping = () => {
      const currentText = typewriterPhrases[currentPhrase];
      
      // Typing out
      if (!isDeleting && displayText.length < currentText.length) {
        // Type just 1 character at a time for a more deliberate effect
        setDisplayText(currentText.substring(0, displayText.length + 1));
        
        // Moderate typing speed
        setTypingSpeed(55 + Math.random() * 20);
      } 
      // Finished typing, pause before deleting
      else if (!isDeleting && displayText.length === currentText.length) {
        setIsDeleting(true);
        setTypingSpeed(2500); // Much longer pause to appreciate the complete phrase
      } 
      // Deleting
      else if (isDeleting && displayText.length > 0) {
        // Delete 1-2 characters at once for moderate deletion
        const charsToRemove = Math.min(
          displayText.length,
          Math.random() < 0.7 ? 1 : 2 // 70% chance of deleting just 1 character
        );
        setDisplayText(currentText.substring(0, displayText.length - charsToRemove));
        
        // Moderate deletion speed
        setTypingSpeed(30 + Math.random() * 15);
      } 
      // Finished deleting, move to next phrase
      else if (isDeleting && displayText.length === 0) {
        setIsDeleting(false);
        setCurrentPhrase((prev) => (prev + 1) % typewriterPhrases.length);
        setTypingSpeed(250); // Moderate pause before typing new phrase
      }
    };
    
    const typingTimer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(typingTimer);
  }, [displayText, currentPhrase, isDeleting, typingSpeed]);

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <HeroAnimation />
      
      <div className="container mx-auto px-4 md:px-6 z-10 pt-0 mt-2">
        <div className="max-w-3xl ml-8 md:ml-16">
          <motion.div
            className="mb-8 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NowPlaying />
            <WeatherWidget />
          </motion.div>

          <motion.p
            className="text-secondary font-mono mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Hi, my name is
          </motion.p>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-textPrimary mb-4 inline-flex flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="mr-3">Wesley</span>
            <span className="text-secondary">
              Dalton
            </span>
            <span className="text-textPrimary">.</span>
          </motion.h1>
          
          <div className="mb-8">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-textPrimary flex flex-row flex-wrap items-baseline gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span>I build</span>
              
              <span className="flex items-baseline">
                <span 
                  className="text-secondary inline-block relative after:content-[''] after:absolute after:right-0 after:top-0 after:h-full after:w-[2px] after:bg-secondary after:animate-[blink_0.85s_infinite]"
                >
                  {displayText}
                </span>
                <span className="text-textPrimary">.</span>
              </span>
            </motion.h2>
          </div>
          
          <motion.p
            className="text-textSecondary text-lg mb-10 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            I'm a Computer Science & History student at the University of Pennsylvania, 
            specializing in software engineering, machine learning, and product development.
            Currently focused on building AI-driven solutions that solve real business problems.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a 
              href="#projects" 
              className="button-primary relative overflow-hidden group"
            >
              <span className="relative z-10">Check out my work</span>
              <span className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            </a>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1, 
          delay: 2.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <a 
          href="#about" 
          className="flex flex-col items-center text-secondary"
          aria-label="Scroll to about section"
        >
          <span className="font-mono text-xs mb-2">Scroll Down</span>
          <FiArrowDown className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}