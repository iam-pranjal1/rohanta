import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';

const AnimatedCard = ({ children, delay = 0, className = '', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card
      className={`transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
};

export default AnimatedCard;
