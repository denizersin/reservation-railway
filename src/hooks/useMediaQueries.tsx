import { useLayoutEffect, useState } from 'react';

export const useIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  const [isMobile, setIsMobile] = useState(
    document?.documentElement?.clientWidth < 768
  );

  useLayoutEffect(() => {
    const updateSize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', updateSize);
    // updateSize();
    return (): void => window.removeEventListener('resize', updateSize);
  }, []);

  return isMobile;
};

export default useIsMobile;