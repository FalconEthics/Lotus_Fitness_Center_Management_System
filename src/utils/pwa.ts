// PWA utilities for Lotus Fitness Center Management System

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, app will update on next reload');
              // Could show notification to user about update
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Service Workers not supported');
    return null;
  }
}

// Listen for install prompt
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt triggered');
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Could show custom install button here
    showInstallButton();
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    hideInstallButton();
  });
}

// Show install button/banner
function showInstallButton(): void {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'block';
  } else {
    // Create install prompt UI dynamically if needed
    createInstallPrompt();
  }
}

// Hide install button
function hideInstallButton(): void {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Create install prompt UI
function createInstallPrompt(): void {
  const promptDiv = document.createElement('div');
  promptDiv.id = 'pwa-install-prompt';
  promptDiv.className = 'fixed bottom-4 right-4 bg-primary text-primary-content p-4 rounded-lg shadow-lg z-50 max-w-sm';
  promptDiv.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <h3 class="font-semibold text-sm">Install LFC Management</h3>
        <p class="text-xs opacity-90">Get quick access from your home screen</p>
      </div>
      <div class="flex gap-2">
        <button id="pwa-install-button" class="btn btn-sm btn-secondary">Install</button>
        <button id="pwa-dismiss-button" class="btn btn-sm btn-ghost">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(promptDiv);
  
  // Add event listeners
  const installButton = document.getElementById('pwa-install-button');
  const dismissButton = document.getElementById('pwa-dismiss-button');
  
  installButton?.addEventListener('click', handleInstallClick);
  dismissButton?.addEventListener('click', () => {
    promptDiv.remove();
  });
}

// Handle install button click
async function handleInstallClick(): Promise<void> {
  if (deferredPrompt) {
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      deferredPrompt = null;
      
      // Remove prompt UI
      const promptDiv = document.getElementById('pwa-install-prompt');
      promptDiv?.remove();
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  }
}

// Check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const persistent = await navigator.storage.persist();
      console.log(`Persistent storage: ${persistent}`);
      return persistent;
    } catch (error) {
      console.error('Persistent storage request failed:', error);
      return false;
    }
  }
  return false;
}

// Get storage quota information
export async function getStorageInfo(): Promise<StorageEstimate | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      console.log('Storage estimate:', estimate);
      return estimate;
    } catch (error) {
      console.error('Storage estimate failed:', error);
      return null;
    }
  }
  return null;
}

// Initialize PWA features
export function initializePWA(): void {
  registerServiceWorker();
  setupInstallPrompt();
  requestPersistentStorage();
  
  // Log PWA status
  console.log('PWA initialized');
  console.log('Running as PWA:', isPWA());
}