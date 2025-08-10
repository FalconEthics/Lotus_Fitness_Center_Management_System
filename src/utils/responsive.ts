import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

// Breakpoint definitions following Tailwind CSS
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook to detect current screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint;
  }>(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, breakpoint: 'lg' };
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getCurrentBreakpoint(width);
    
    return { width, height, breakpoint };
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getCurrentBreakpoint(width);
      
      setScreenSize({ width, height, breakpoint });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
}

// Get current breakpoint based on width
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

// Hook to check if screen is at or above a certain breakpoint
export function useMediaQuery(minBreakpoint: Breakpoint) {
  const { width } = useScreenSize();
  return width >= breakpoints[minBreakpoint];
}

// Hook to get device type
export function useDeviceType() {
  const { width, breakpoint } = useScreenSize();
  
  return {
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallMobile: width < 375,
    isLargeMobile: width >= 375 && width < 640,
    breakpoint,
  };
}

// Hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>) {
  const { breakpoint } = useScreenSize();
  
  // Find the appropriate value by checking breakpoints in descending order
  const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  for (const bp of orderedBreakpoints) {
    if (breakpoints[bp] <= breakpoints[breakpoint] && values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Fallback to the smallest available value
  return values.xs || values.sm || values.md || values.lg || values.xl || values['2xl'];
}

// Responsive grid columns helper
export function useResponsiveGrid(config: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}) {
  const columns = useResponsiveValue(config);
  return {
    columns,
    gridCols: `grid-cols-${columns}`,
  };
}

// Touch device detection
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };
    
    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);
  
  return isTouch;
}

// Safe area handling for mobile devices
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

// Viewport height handling for mobile browsers
export function useViewportHeight() {
  const [vh, setVh] = useState(() => {
    if (typeof window === 'undefined') return 768;
    return window.innerHeight;
  });

  useEffect(() => {
    const updateVh = debounce(() => {
      setVh(window.innerHeight);
      // Set CSS custom property for mobile viewport height
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }, 100);

    updateVh();
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);

    return () => {
      updateVh.cancel();
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, []);

  return vh;
}

// Helper function to generate responsive classes
export function generateResponsiveClasses(
  property: string,
  values: Partial<Record<Breakpoint, string | number>>
): string {
  return Object.entries(values)
    .map(([breakpoint, value]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}${property}-${value}`;
    })
    .join(' ');
}

// Responsive container helper
export function useResponsiveContainer() {
  const { breakpoint } = useScreenSize();
  
  const containerClasses = {
    xs: 'px-4 max-w-none',
    sm: 'px-6 max-w-none',
    md: 'px-8 max-w-3xl mx-auto',
    lg: 'px-8 max-w-5xl mx-auto',
    xl: 'px-8 max-w-6xl mx-auto',
    '2xl': 'px-8 max-w-7xl mx-auto',
  };

  return containerClasses[breakpoint];
}