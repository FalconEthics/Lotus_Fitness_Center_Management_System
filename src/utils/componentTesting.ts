// Component testing and consistency utilities

import { Component, ReactElement, ReactNode } from 'react';

// Design system consistency checker
export interface DesignToken {
  colors: {
    primary: string[];
    neutral: string[];
    semantic: {
      success: string[];
      warning: string[];
      error: string[];
    };
  };
  typography: {
    sizes: string[];
    weights: string[];
  };
  spacing: {
    units: string[];
  };
  borderRadius: string[];
  shadows: string[];
}

// Expected design tokens based on our theme
export const EXPECTED_DESIGN_TOKENS: DesignToken = {
  colors: {
    primary: ['red-50', 'red-100', 'red-500', 'red-600', 'red-700'],
    neutral: ['white', 'neutral-50', 'neutral-100', 'neutral-200', 'neutral-300', 'neutral-400', 'neutral-500', 'neutral-600', 'neutral-700', 'neutral-800', 'neutral-900'],
    semantic: {
      success: ['green-50', 'green-100', 'green-500', 'green-600'],
      warning: ['yellow-50', 'yellow-100', 'yellow-500', 'yellow-600'],
      error: ['red-50', 'red-100', 'red-500', 'red-600'],
    },
  },
  typography: {
    sizes: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
    weights: ['font-normal', 'font-medium', 'font-semibold', 'font-bold'],
  },
  spacing: {
    units: ['p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8'],
  },
  borderRadius: ['rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl'],
  shadows: ['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl'],
};

// Component consistency audit
export interface ComponentAuditResult {
  componentName: string;
  passes: string[];
  warnings: string[];
  errors: string[];
  score: number;
}

// Responsive breakpoint checker
export function checkResponsiveImplementation(componentHTML: string): {
  hasResponsiveClasses: boolean;
  breakpoints: string[];
  recommendations: string[];
} {
  const responsiveRegex = /(sm:|md:|lg:|xl:|2xl:)/g;
  const matches = componentHTML.match(responsiveRegex) || [];
  const breakpoints = Array.from(new Set(matches.map(match => match.replace(':', ''))));
  
  const recommendations: string[] = [];
  if (!breakpoints.includes('sm') && !breakpoints.includes('md')) {
    recommendations.push('Consider adding tablet-specific styling (md: classes)');
  }
  if (!breakpoints.includes('lg')) {
    recommendations.push('Consider adding desktop-specific styling (lg: classes)');
  }
  
  return {
    hasResponsiveClasses: breakpoints.length > 0,
    breakpoints,
    recommendations,
  };
}

// Accessibility checker
export function checkAccessibility(componentHTML: string): {
  hasAriaLabels: boolean;
  hasSemanticTags: boolean;
  hasFocusStates: boolean;
  recommendations: string[];
} {
  const ariaRegex = /aria-[a-zA-Z-]+=/g;
  const semanticTagsRegex = /<(header|nav|main|section|article|aside|footer|button|input|label)/g;
  const focusRegex = /focus:/g;
  
  const hasAriaLabels = ariaRegex.test(componentHTML);
  const hasSemanticTags = semanticTagsRegex.test(componentHTML);
  const hasFocusStates = focusRegex.test(componentHTML);
  
  const recommendations: string[] = [];
  if (!hasAriaLabels) {
    recommendations.push('Add ARIA labels for better screen reader support');
  }
  if (!hasSemanticTags) {
    recommendations.push('Use semantic HTML tags (header, nav, main, etc.)');
  }
  if (!hasFocusStates) {
    recommendations.push('Add focus states for better keyboard navigation');
  }
  
  return {
    hasAriaLabels,
    hasSemanticTags,
    hasFocusStates,
    recommendations,
  };
}

// Performance checker
export function checkPerformance(componentCode: string): {
  hasMemoization: boolean;
  hasUselessReRenders: boolean;
  hasOptimalHooks: boolean;
  recommendations: string[];
} {
  const memoRegex = /(useMemo|useCallback|React\.memo)/g;
  const stateRegex = /useState/g;
  const effectRegex = /useEffect/g;
  
  const hasMemoization = memoRegex.test(componentCode);
  const stateCount = (componentCode.match(stateRegex) || []).length;
  const effectCount = (componentCode.match(effectRegex) || []).length;
  
  const recommendations: string[] = [];
  if (stateCount > 5) {
    recommendations.push('Consider using useReducer for complex state management');
  }
  if (effectCount > 3) {
    recommendations.push('Review useEffect dependencies to prevent unnecessary re-renders');
  }
  if (!hasMemoization && (stateCount > 2 || effectCount > 1)) {
    recommendations.push('Consider using useMemo/useCallback for expensive computations');
  }
  
  return {
    hasMemoization,
    hasUselessReRenders: stateCount > 5,
    hasOptimalHooks: stateCount <= 5 && effectCount <= 3,
    recommendations,
  };
}

// Design system consistency checker
export function checkDesignConsistency(componentHTML: string): {
  usesDesignTokens: boolean;
  inconsistentPatterns: string[];
  score: number;
} {
  let score = 100;
  const inconsistentPatterns: string[] = [];
  
  // Check for hardcoded colors
  const hardcodedColors = componentHTML.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(|rgba\(/g);
  if (hardcodedColors) {
    inconsistentPatterns.push(`Hardcoded colors found: ${hardcodedColors.length}`);
    score -= hardcodedColors.length * 5;
  }
  
  // Check for inconsistent spacing patterns
  const spacingPattern = /[mp]-\d+/g;
  const spacings = componentHTML.match(spacingPattern) || [];
  const uniqueSpacings = Array.from(new Set(spacings));
  if (uniqueSpacings.length > 8) {
    inconsistentPatterns.push('Too many different spacing values used');
    score -= 10;
  }
  
  // Check for mixed design patterns
  if (componentHTML.includes('bg-blue-') && componentHTML.includes('bg-red-')) {
    // This might be okay for status indicators, but worth noting
    inconsistentPatterns.push('Mixed color schemes detected');
  }
  
  return {
    usesDesignTokens: !hardcodedColors,
    inconsistentPatterns,
    score: Math.max(0, score),
  };
}

// Animation consistency checker
export function checkAnimationConsistency(componentCode: string): {
  usesFramerMotion: boolean;
  hasConsistentTiming: boolean;
  hasAccessibleAnimations: boolean;
  recommendations: string[];
} {
  const framerMotionRegex = /(motion\.|AnimatePresence|framer-motion)/g;
  const animationRegex = /(duration|transition|delay):/g;
  const reducedMotionRegex = /prefers-reduced-motion/g;
  
  const usesFramerMotion = framerMotionRegex.test(componentCode);
  const hasAnimations = animationRegex.test(componentCode);
  const hasAccessibleAnimations = reducedMotionRegex.test(componentCode);
  
  const recommendations: string[] = [];
  if (hasAnimations && !usesFramerMotion) {
    recommendations.push('Consider using Framer Motion for consistent animations');
  }
  if (hasAnimations && !hasAccessibleAnimations) {
    recommendations.push('Add prefers-reduced-motion support for accessibility');
  }
  
  return {
    usesFramerMotion,
    hasConsistentTiming: true, // Would need deeper analysis
    hasAccessibleAnimations,
    recommendations,
  };
}

// Overall component audit function
export function auditComponent(
  componentName: string,
  componentCode: string,
  componentHTML?: string
): ComponentAuditResult {
  const passes: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  let score = 100;
  
  // Performance check
  const perfCheck = checkPerformance(componentCode);
  if (perfCheck.hasOptimalHooks) {
    passes.push('Optimal hook usage');
  } else {
    warnings.push('Consider optimizing hooks usage');
    score -= 10;
  }
  
  if (perfCheck.hasMemoization) {
    passes.push('Uses performance optimizations');
  } else if (componentCode.includes('useState') || componentCode.includes('useEffect')) {
    warnings.push('Consider adding memoization for better performance');
    score -= 5;
  }
  
  // HTML structure check (if provided)
  if (componentHTML) {
    const a11yCheck = checkAccessibility(componentHTML);
    const responsiveCheck = checkResponsiveImplementation(componentHTML);
    const designCheck = checkDesignConsistency(componentHTML);
    
    // Accessibility
    if (a11yCheck.hasSemanticTags) passes.push('Uses semantic HTML');
    else { warnings.push('Missing semantic HTML tags'); score -= 15; }
    
    if (a11yCheck.hasFocusStates) passes.push('Has focus states');
    else { warnings.push('Missing focus states for keyboard navigation'); score -= 10; }
    
    // Responsive design
    if (responsiveCheck.hasResponsiveClasses) {
      passes.push('Implements responsive design');
    } else {
      errors.push('Missing responsive breakpoint classes');
      score -= 20;
    }
    
    // Design consistency
    if (designCheck.usesDesignTokens) {
      passes.push('Uses design system tokens');
    } else {
      warnings.push('Contains hardcoded styles');
      score -= 15;
    }
    
    score = Math.min(score, designCheck.score);
  }
  
  // Animation check
  const animCheck = checkAnimationConsistency(componentCode);
  if (animCheck.usesFramerMotion) {
    passes.push('Uses consistent animation library');
  }
  
  // TypeScript usage check
  if (componentCode.includes(': React.FC') || componentCode.includes('interface ') || componentCode.includes('type ')) {
    passes.push('Uses TypeScript for type safety');
  } else {
    warnings.push('Consider adding TypeScript interfaces');
    score -= 5;
  }
  
  // Error boundary check
  if (componentCode.includes('try') && componentCode.includes('catch')) {
    passes.push('Has error handling');
  } else if (componentCode.includes('useState') || componentCode.includes('useEffect')) {
    warnings.push('Consider adding error boundaries');
    score -= 5;
  }
  
  return {
    componentName,
    passes,
    warnings,
    errors,
    score: Math.max(0, Math.min(100, score)),
  };
}

// Generate a comprehensive audit report
export function generateAuditReport(audits: ComponentAuditResult[]): {
  overallScore: number;
  totalComponents: number;
  highScoreComponents: number;
  needsImprovementComponents: number;
  commonIssues: string[];
  recommendations: string[];
} {
  const totalComponents = audits.length;
  const overallScore = Math.round(audits.reduce((sum, audit) => sum + audit.score, 0) / totalComponents);
  const highScoreComponents = audits.filter(audit => audit.score >= 80).length;
  const needsImprovementComponents = audits.filter(audit => audit.score < 60).length;
  
  // Count common issues
  const allWarnings = audits.flatMap(audit => audit.warnings);
  const allErrors = audits.flatMap(audit => audit.errors);
  const issueCount = [...allWarnings, ...allErrors].reduce((count, issue) => {
    count[issue] = (count[issue] || 0) + 1;
    return count;
  }, {} as Record<string, number>);
  
  const commonIssues = Object.entries(issueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([issue, count]) => `${issue} (${count} components)`);
  
  const recommendations: string[] = [
    'Ensure all components use responsive design patterns',
    'Add proper ARIA labels and semantic HTML',
    'Implement consistent animation patterns',
    'Use TypeScript interfaces for all props',
    'Add error boundaries for better UX',
    'Optimize performance with memoization where needed',
  ];
  
  return {
    overallScore,
    totalComponents,
    highScoreComponents,
    needsImprovementComponents,
    commonIssues,
    recommendations,
  };
}