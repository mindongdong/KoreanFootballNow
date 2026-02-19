import { useState, useEffect, RefObject } from 'react';

interface ScrollShadowState {
  scrolled: boolean;
  scrolledEnd: boolean;
}

export function useScrollShadow(ref: RefObject<HTMLElement>): ScrollShadowState {
  const [state, setState] = useState<ScrollShadowState>({
    scrolled: false,
    scrolledEnd: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setState({
        scrolled: scrollLeft > 0,
        scrolledEnd: scrollLeft + clientWidth >= scrollWidth - 1,
      });
    };

    handleScroll();
    element.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [ref]);

  return state;
}
