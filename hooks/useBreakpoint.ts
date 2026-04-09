import { useEffect, useState } from 'react';

const getWidth = () => (typeof window === 'undefined' ? 1440 : window.innerWidth);

export function useBreakpoint() {
    const [width, setWidth] = useState(getWidth);

    useEffect(() => {
        const handleResize = () => setWidth(getWidth());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isLaptop: width >= 1024 && width < 1280,
        isDesktop: width >= 1280
    };
}
