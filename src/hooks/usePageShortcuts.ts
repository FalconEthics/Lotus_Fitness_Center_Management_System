import { useEffect } from 'react';

export interface PageShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function usePageShortcuts(shortcuts: PageShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey) &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.metaKey === event.metaKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

// Common page shortcuts that can be reused
export const commonPageShortcuts = {
  search: (focusSearchFn: () => void): PageShortcut => ({
    key: '/',
    action: focusSearchFn,
    description: 'Focus search field'
  }),
  
  add: (addItemFn: () => void): PageShortcut => ({
    key: 'a',
    action: addItemFn,
    description: 'Add new item'
  }),
  
  refresh: (refreshFn: () => void): PageShortcut => ({
    key: 'r',
    action: refreshFn,
    description: 'Refresh data'
  }),
  
  export: (exportFn: () => void): PageShortcut => ({
    key: 'e',
    action: exportFn,
    description: 'Export data'
  }),
  
  selectAll: (selectAllFn: () => void): PageShortcut => ({
    key: 'a',
    ctrlKey: true,
    action: selectAllFn,
    description: 'Select all items'
  }),
  
  clearFilters: (clearFiltersFn: () => void): PageShortcut => ({
    key: 'x',
    action: clearFiltersFn,
    description: 'Clear all filters'
  })
};