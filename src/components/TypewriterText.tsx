
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 30, onComplete, className }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        setDisplayedText(''); // Reset on text change

        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]); // Run when text changes

    return <span className={className}>{displayedText}</span>;
};
