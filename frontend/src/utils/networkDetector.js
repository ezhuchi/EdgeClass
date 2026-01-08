/**
 * Network Detection Utility
 * Detects bandwidth speed and provides adaptive content delivery
 * Uses Network Information API with fallbacks
 */

class NetworkDetector {
  constructor() {
    this.connection = null;
    this.listeners = [];
    this.connectionType = 'unknown';
    this.effectiveType = '4g'; // Default to 4g
    this.downlink = null;
    this.isLiteMode = localStorage.getItem('edgeclass_lite_mode') === 'true';
    
    this.init();
  }

  init() {
    // Check for Network Information API support
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      // Update connection info
      this.updateConnectionInfo();
      
      // Listen for connection changes
      this.connection.addEventListener('change', () => {
        this.updateConnectionInfo();
        this.notifyListeners();
      });
    } else {
      console.warn('Network Information API not supported. Using fallback detection.');
      this.useFallbackDetection();
    }
  }

  updateConnectionInfo() {
    if (!this.connection) return;
    
    this.effectiveType = this.connection.effectiveType || '4g';
    this.downlink = this.connection.downlink; // Mbps
    this.connectionType = this.connection.type || 'unknown';
    
    console.log(`Network: ${this.effectiveType}, Downlink: ${this.downlink} Mbps`);
  }

  // Fallback: Estimate connection based on download test
  async useFallbackDetection() {
    try {
      const startTime = performance.now();
      const imageSize = 10240; // 10KB test image
      const testImage = new Image();
      
      await new Promise((resolve, reject) => {
        testImage.onload = resolve;
        testImage.onerror = reject;
        // Use a small resource from your server
        testImage.src = `${window.location.origin}/favicon.ico?t=${Date.now()}`;
      });
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds
      const speedBps = imageSize / duration;
      const speedKbps = speedBps / 1024;
      
      // Estimate effective type
      if (speedKbps < 50) {
        this.effectiveType = '2g';
      } else if (speedKbps < 250) {
        this.effectiveType = '3g';
      } else {
        this.effectiveType = '4g';
      }
      
      console.log(`Fallback detection: ${speedKbps.toFixed(2)} Kbps → ${this.effectiveType}`);
    } catch (error) {
      console.error('Fallback detection failed:', error);
      this.effectiveType = '4g'; // Default assumption
    }
  }

  // Get current connection type
  getConnectionType() {
    return this.isLiteMode ? '2g' : this.effectiveType;
  }

  // Check if slow connection (2G or 3G)
  isSlowConnection() {
    const type = this.getConnectionType();
    return type === '2g' || type === 'slow-2g';
  }

  // Check if moderate connection
  isModerateConnection() {
    return this.getConnectionType() === '3g';
  }

  // Check if fast connection
  isFastConnection() {
    const type = this.getConnectionType();
    return type === '4g';
  }

  // Get recommended sync delay based on connection
  getSyncDelay() {
    const type = this.getConnectionType();
    switch (type) {
      case 'slow-2g':
        return 60000; // 1 minute
      case '2g':
        return 30000; // 30 seconds
      case '3g':
        return 15000; // 15 seconds
      case '4g':
      default:
        return 5000; // 5 seconds
    }
  }

  // Get recommended batch size for sync
  getBatchSize() {
    const type = this.getConnectionType();
    switch (type) {
      case 'slow-2g':
      case '2g':
        return 2; // Sync 2 items at a time
      case '3g':
        return 3;
      case '4g':
      default:
        return 5; // Sync 5 items at a time
    }
  }

  // Get data saver recommendations
  getDataSaverConfig() {
    const isSlow = this.isSlowConnection();
    return {
      enableImages: !isSlow,
      enableAnimations: !isSlow,
      compressImages: isSlow,
      reducedMotion: isSlow,
      syncDelay: this.getSyncDelay(),
      batchSize: this.getBatchSize()
    };
  }

  // Toggle lite mode (manual override)
  toggleLiteMode() {
    this.isLiteMode = !this.isLiteMode;
    localStorage.setItem('edgeclass_lite_mode', this.isLiteMode);
    this.notifyListeners();
    return this.isLiteMode;
  }

  // Get lite mode status
  getLiteMode() {
    return this.isLiteMode;
  }

  // Subscribe to network changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners of changes
  notifyListeners() {
    const info = this.getNetworkInfo();
    this.listeners.forEach(listener => listener(info));
  }

  // Get comprehensive network info
  getNetworkInfo() {
    return {
      effectiveType: this.getConnectionType(),
      downlink: this.downlink,
      connectionType: this.connectionType,
      isOnline: navigator.onLine,
      isLiteMode: this.isLiteMode,
      isSlow: this.isSlowConnection(),
      isModerate: this.isModerateConnection(),
      isFast: this.isFastConnection(),
      syncDelay: this.getSyncDelay(),
      batchSize: this.getBatchSize(),
      dataSaver: this.getDataSaverConfig()
    };
  }
}

// Singleton instance
export const networkDetector = new NetworkDetector();

export default networkDetector;
