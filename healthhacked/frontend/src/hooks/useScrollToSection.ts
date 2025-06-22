import { useCallback } from 'react';

interface ScrollToSectionOptions {
  behavior?: 'smooth' | 'instant' | 'auto';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
  offset?: number; // Additional offset in pixels
}

export const useScrollToSection = () => {
  const scrollToSection = useCallback((
    sectionId: string, 
    options: ScrollToSectionOptions = {}
  ) => {
    const {
      behavior = 'smooth',
      block = 'start',
      inline = 'nearest',
      offset = 0
    } = options;

    try {
      const element = document.getElementById(sectionId);
      
      if (!element) {
        console.warn(`Element with id "${sectionId}" not found`);
        return;
      }

      if (offset === 0) {
        // Simple scroll without offset
        element.scrollIntoView({
          behavior,
          block,
          inline
        });
      } else {
        // Calculate position with offset
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior
        });
      }
    } catch (error) {
      console.error('Error scrolling to section:', error);
    }
  }, []);

  // Helper function to scroll to top
  const scrollToTop = useCallback((behavior: 'smooth' | 'instant' | 'auto' = 'smooth') => {
    window.scrollTo({
      top: 0,
      behavior
    });
  }, []);

  return {
    scrollToSection,
    scrollToTop
  };
};