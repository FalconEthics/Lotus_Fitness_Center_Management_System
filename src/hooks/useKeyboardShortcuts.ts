import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  // Define all keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => navigate('/managemembers'),
      description: 'Go to Members',
      category: 'Navigation'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => navigate('/manageclasses'),
      description: 'Go to Classes',
      category: 'Navigation'
    },
    {
      key: '4',
      ctrlKey: true,
      action: () => navigate('/manageplans'),
      description: 'Go to Plans',
      category: 'Navigation'
    },
    {
      key: '5',
      ctrlKey: true,
      action: () => navigate('/managetrainers'),
      description: 'Go to Trainers',
      category: 'Navigation'
    },
    {
      key: '6',
      ctrlKey: true,
      action: () => navigate('/attendance'),
      description: 'Go to Attendance',
      category: 'Navigation'
    },
    {
      key: '7',
      ctrlKey: true,
      action: () => navigate('/profile'),
      description: 'Go to Profile',
      category: 'Navigation'
    },
    
    // Global actions
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        // Trigger manual save
        const dataset = JSON.parse(localStorage.getItem('lotus-fitness-data') || '{}');
        localStorage.setItem('lotus-fitness-data', JSON.stringify(dataset));
        toast.success('Data saved manually!');
      },
      description: 'Save data manually',
      category: 'Global'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        showShortcutsHelp();
      },
      description: 'Show keyboard shortcuts help',
      category: 'Global'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          toast.success('Search focused');
        } else {
          toast.info('No search field available on this page');
        }
      },
      description: 'Focus search field',
      category: 'Global'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Try to find and click "Add" or "New" buttons
        const addButtons = document.querySelectorAll('button');
        const addButton = Array.from(addButtons).find(btn => 
          btn.textContent?.toLowerCase().includes('add') || 
          btn.textContent?.toLowerCase().includes('new') ||
          btn.querySelector('svg[data-testid*="plus" i]')
        );
        if (addButton) {
          (addButton as HTMLButtonElement).click();
          toast.success('Add new item');
        } else {
          toast.info('No add button available on this page');
        }
      },
      description: 'Add new item',
      category: 'Global'
    },
    
    // Theme shortcuts
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Toggle theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toast.success(`Switched to ${newTheme} theme`);
      },
      description: 'Toggle theme (light/dark)',
      category: 'Global'
    },
    
    // Quick exports
    {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Trigger data export
        try {
          const dataset = JSON.parse(localStorage.getItem('lotus-fitness-data') || '{}');
          const dataToExport = {
            ...dataset,
            exportDate: new Date().toISOString(),
            version: '1.0'
          };
          
          const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
          });
          
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `lotus-fitness-export-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Data exported successfully!');
        } catch (error) {
          toast.error('Failed to export data');
        }
      },
      description: 'Export data',
      category: 'Global'
    }
  ];

  const showShortcutsHelp = useCallback(() => {
    // Group shortcuts by category
    const categories = shortcuts.reduce((acc, shortcut) => {
      const category = shortcut.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    // Create help modal content
    let helpContent = '<div style="font-family: ui-monospace, monospace; font-size: 14px; line-height: 1.6;">';
    helpContent += '<h3 style="margin-bottom: 20px; color: #374151; font-size: 18px;">Keyboard Shortcuts</h3>';
    
    Object.entries(categories).forEach(([category, categoryShortcuts]) => {
      helpContent += `<div style="margin-bottom: 24px;">`;
      helpContent += `<h4 style="margin-bottom: 12px; color: #6b7280; font-size: 14px; font-weight: 600;">${category}</h4>`;
      
      categoryShortcuts.forEach(shortcut => {
        const keys = [];
        if (shortcut.ctrlKey) keys.push('Ctrl');
        if (shortcut.shiftKey) keys.push('Shift');
        if (shortcut.altKey) keys.push('Alt');
        if (shortcut.metaKey) keys.push('Cmd');
        keys.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
        
        const keyCombo = keys.join(' + ');
        helpContent += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0;">`;
        helpContent += `<span style="color: #374151;">${shortcut.description}</span>`;
        helpContent += `<kbd style="background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${keyCombo}</kbd>`;
        helpContent += `</div>`;
      });
      
      helpContent += `</div>`;
    });
    
    helpContent += '</div>';

    // Create and show modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(0,0,0,0.5); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white; 
      border-radius: 12px; 
      padding: 24px; 
      max-width: 600px; 
      max-height: 80vh; 
      overflow-y: auto; 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e5e7eb;
    `;
    content.innerHTML = helpContent;
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute; 
      top: 12px; 
      right: 16px; 
      background: none; 
      border: none; 
      font-size: 24px; 
      cursor: pointer; 
      color: #6b7280;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    `;
    closeButton.onmouseover = () => closeButton.style.background = '#f3f4f6';
    closeButton.onmouseout = () => closeButton.style.background = 'none';
    
    content.style.position = 'relative';
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    closeButton.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
    
    // Close on escape
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
  }, [shortcuts]);

  useEffect(() => {
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
  }, [shortcuts, navigate]);

  return { shortcuts, showShortcutsHelp };
}

// Export individual shortcut functions for use in components
export const keyboardShortcuts = {
  focusSearch: () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  },
  
  triggerAdd: () => {
    const addButtons = document.querySelectorAll('button');
    const addButton = Array.from(addButtons).find(btn => 
      btn.textContent?.toLowerCase().includes('add') || 
      btn.textContent?.toLowerCase().includes('new')
    );
    if (addButton) {
      (addButton as HTMLButtonElement).click();
    }
  }
};