/**
 * Browser Console Error Monitor (Paste in DevTools Console)
 * This helps track errors while testing buttons
 */

// Initialize error tracker
window.testErrors = {
  errors: [],
  warnings: [],
  logs: [],
  startTime: new Date(),
  
  // Log error
  logError(error, source) {
    this.errors.push({
      time: new Date(),
      error: error.toString(),
      source: source || 'Unknown',
      stack: error.stack
    });
    console.error(`[TEST ERROR] ${error}`);
  },
  
  // Log warning
  logWarning(msg) {
    this.warnings.push({
      time: new Date(),
      message: msg
    });
    console.warn(`[TEST WARNING] ${msg}`);
  },
  
  // Log info
  logInfo(msg) {
    this.logs.push({
      time: new Date(),
      message: msg
    });
    console.log(`[TEST INFO] ${msg}`);
  },
  
  // Summary report
  report() {
    const elapsed = (new Date() - this.startTime) / 1000;
    console.group('📊 TEST SUMMARY');
    console.log(`Duration: ${elapsed.toFixed(2)}s`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Info logs: ${this.logs.length}`);
    console.groupEnd();
    
    if (this.errors.length > 0) {
      console.group('❌ ERRORS');
      this.errors.forEach((err, i) => {
        console.error(`${i + 1}. [${err.source}] ${err.error}`);
      });
      console.groupEnd();
    }
    
    if (this.warnings.length > 0) {
      console.group('⚠️ WARNINGS');
      this.warnings.forEach((warn, i) => {
        console.warn(`${i + 1}. ${warn.message}`);
      });
      console.groupEnd();
    }
    
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      passed: this.errors.length === 0
    };
  },
  
  // Export as JSON
  export() {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: (new Date() - this.startTime) / 1000,
      errors: this.errors,
      warnings: this.warnings,
      logs: this.logs
    }, null, 2);
  },
  
  // Clear
  clear() {
    this.errors = [];
    this.warnings = [];
    this.logs = [];
    console.log('✓ Test tracking cleared');
  }
};

// Hook into console methods
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  if (args[0]?.includes && !args[0].includes('[TEST')) {
    window.testErrors.errors.push({
      time: new Date(),
      error: args.join(' '),
      source: 'Console Error'
    });
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  if (args[0]?.includes && !args[0].includes('[TEST')) {
    window.testErrors.warnings.push({
      time: new Date(),
      warning: args.join(' ')
    });
  }
  originalWarn.apply(console, args);
};

// Track JavaScript errors
window.addEventListener('error', (event) => {
  window.testErrors.logError(event.error, 'JavaScript Error');
});

// Track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  window.testErrors.logError(event.reason, 'Unhandled Promise');
});

// Track network errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(response => {
      if (!response.ok) {
        window.testErrors.logWarning(`HTTP ${response.status} ${args[0]}`);
      }
      return response;
    })
    .catch(error => {
      window.testErrors.logError(error, 'Network Error');
      throw error;
    });
};

console.log(`
✅ Test Monitor Initialized!

Commands:
  testErrors.report()  - Show summary
  testErrors.export()  - Export as JSON
  testErrors.clear()   - Clear tracking

As you test each button, errors will be tracked automatically.
Check testErrors.report() after testing each flow.
`);
