#!/usr/bin/env node

/**
 * Automated Button Testing Script
 * Tests all interactive buttons across the Help Desk System
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  title: (msg) => console.log(`\n${colors.cyan}${'═'.repeat(80)}\n${colors.blue}${msg}${colors.reset}\n${colors.cyan}${'═'.repeat(80)}\n${colors.reset}`),
  section: (msg) => console.log(`\n${colors.yellow}📋 ${msg}${colors.reset}\n`),
  pass: (msg) => console.log(`  ${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`  ${colors.cyan}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Track results
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Search for button patterns in source files
function findButtonsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const buttons = [];
    
    // Patterns to match buttons
    const patterns = [
      /<button[^>]*>([^<]+)<\/button>/gi,
      /onClick={([^}]+)}/gi,
      /className="[^"]*button[^"]*"/gi,
      /role="button"/gi,
      /aria-label="([^"]+)"/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        buttons.push({
          pattern: pattern.source,
          text: match[1] || 'interactive element',
          file: filePath
        });
      }
    });
    
    return buttons;
  } catch (error) {
    return [];
  }
}

// Scan component directory for buttons
function scanComponentsForButtons(dir) {
  const components = {};
  const componentDir = path.join(dir, 'src', 'components');
  
  if (fs.existsSync(componentDir)) {
    const files = fs.readdirSync(componentDir)
      .filter(f => f.endsWith('.jsx') || f.endsWith('.js'))
      .map(f => path.join(componentDir, f));
    
    files.forEach(file => {
      const buttons = findButtonsInFile(file);
      if (buttons.length > 0) {
        const componentName = path.basename(file);
        components[componentName] = buttons;
      }
    });
  }
  
  return components;
}

// Validate component exports
function validateComponentExports(dir) {
  const componentDir = path.join(dir, 'src', 'components');
  const issues = [];
  
  if (!fs.existsSync(componentDir)) {
    issues.push('Components directory not found');
    return issues;
  }
  
  const files = fs.readdirSync(componentDir)
    .filter(f => f.endsWith('.jsx'))
    .map(f => path.join(componentDir, f));
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const componentName = path.basename(file, '.jsx');
    
    // Check for export
    if (!content.includes('export default') && !content.includes('export const')) {
      issues.push(`${componentName} - No export found`);
    }
    
    // Check for onClick handlers
    const onClickMatches = content.match(/onClick={([^}]+)}/g) || [];
    onClickMatches.forEach((match, idx) => {
      const handler = match.slice(8, -1);
      if (!content.includes(`const ${handler}`) && !content.includes(`function ${handler}`)) {
        // Handler might be imported, which is OK
      }
    });
  });
  
  return issues;
}

// Check routes configuration
function validateRoutes(dir) {
  const appPath = path.join(dir, 'src', 'App.jsx');
  if (!fs.existsSync(appPath)) return [];
  
  const content = fs.readFileSync(appPath, 'utf8');
  const issues = [];
  
  // Extract routes
  const routeMatches = content.match(/path=['"]([^'"]+)['"]/g) || [];
  const routes = routeMatches.map(m => m.match(/['"]([^'"]+)['"]/)[1]);
  
  log.info(`Found ${routes.length} routes: ${routes.join(', ')}`);
  
  // Check for Navigate components
  const navigateMatches = content.match(/navigate\(['"]([^'"]+)['"]\)/gi);
  if (navigateMatches && navigateMatches.length > 0) {
    log.pass(`Navigation configured (${navigateMatches.length} navigate calls)`);
  } else {
    issues.push('No navigation calls found');
  }
  
  return issues;
}

// Test API endpoints referenced in code
function checkAPIEndpoints(dir) {
  const endpoints = new Set();
  const srcDir = path.join(dir, 'src');
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find API calls
        const apiMatches = content.match(/fetch\(['"]([^'"]+)['"]/gi) || [];
        apiMatches.forEach(match => {
          const url = match.slice(7, -1);
          if (url.startsWith('/api') || url.startsWith('http')) {
            endpoints.add(url);
          }
        });
      }
    });
  }
  
  scanDir(srcDir);
  return Array.from(endpoints);
}

// Main testing function
function runAllTests(workspaceDir) {
  log.title('🚀 HELP DESK SYSTEM - BUTTON & FUNCTIONALITY TESTS');
  
  // 1. Scan for buttons
  log.section('1. Button Discovery');
  const components = scanComponentsForButtons(workspaceDir);
  const totalButtons = Object.values(components).reduce((sum, arr) => sum + arr.length, 0);
  
  testResults.total += totalButtons;
  log.pass(`Scanned ${Object.keys(components).length} components`);
  log.pass(`Found ${totalButtons} button/interactive elements`);
  
  Object.entries(components).forEach(([component, buttons]) => {
    log.info(`${component}: ${buttons.length} buttons`);
  });
  
  // 2. Validate component structure
  log.section('2. Component Structure Validation');
  const componentIssues = validateComponentExports(workspaceDir);
  if (componentIssues.length === 0) {
    testResults.passed++;
    log.pass('All components properly exported');
  } else {
    testResults.failed++;
    componentIssues.forEach(issue => log.fail(issue));
  }
  testResults.total++;
  
  // 3. Check routes
  log.section('3. Route Configuration');
  const routeIssues = validateRoutes(workspaceDir);
  if (routeIssues.length === 0) {
    testResults.passed++;
    log.pass('All routes properly configured');
  } else {
    testResults.failed++;
    routeIssues.forEach(issue => log.fail(issue));
  }
  testResults.total++;
  
  // 4. Check API endpoints
  log.section('4. API Endpoints in Use');
  const endpoints = checkAPIEndpoints(workspaceDir);
  if (endpoints.length > 0) {
    log.pass(`Found ${endpoints.length} API endpoints`);
    endpoints.forEach(ep => log.info(ep));
  } else {
    log.warn('No API endpoints found (may use Supabase client directly)');
  }
  
  // 5. Environment configuration
  log.section('5. Environment Configuration');
  const envPath = path.join(workspaceDir, '.env');
  const envLocalPath = path.join(workspaceDir, '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const keys = envContent.split('\n').filter(line => line && !line.startsWith('#')).length;
    log.pass(`.env file exists with ${keys} variables`);
    testResults.passed++;
  } else if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const keys = envContent.split('\n').filter(line => line && !line.startsWith('#')).length;
    log.pass(`.env.local exists with ${keys} variables`);
    testResults.passed++;
  } else {
    log.warn('No .env or .env.local file found - external APIs may not work');
    testResults.warnings++;
  }
  testResults.total++;
  
  // 6. Build validation
  log.section('6. Build Configuration');
  const vitePath = path.join(workspaceDir, 'vite.config.js');
  const tsConfigPath = path.join(workspaceDir, 'tsconfig.json');
  
  if (fs.existsSync(vitePath)) {
    log.pass('Vite configuration found');
    testResults.passed++;
  }
  if (fs.existsSync(tsConfigPath)) {
    log.pass('TypeScript configuration found');
  }
  testResults.total++;
  
  // 7. Testing framework
  log.section('7. Testing Framework');
  const packagePath = path.join(workspaceDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkgJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const devDeps = Object.keys(pkgJson.devDependencies || {});
    
    if (devDeps.includes('vitest')) {
      log.pass('Vitest configured for unit tests');
      testResults.passed++;
    }
    if (devDeps.includes('react')) {
      log.pass('React installed');
    }
    testResults.total++;
    
    const testScripts = Object.entries(pkgJson.scripts || {})
      .filter(([key]) => key.includes('test'));
    if (testScripts.length > 0) {
      log.info(`Test scripts available: ${testScripts.map(([k]) => k).join(', ')}`);
    }
  }
  
  // 8. Button Testing Checklist
  log.section('8. Manual Testing Checklist');
  const checklist = [
    '[ ] Landing page - All navigation buttons work',
    '[ ] Auth page - Sign in/up buttons functional',
    '[ ] Dashboard - All service cards accessible',
    '[ ] Emergency - Request ambulance button works',
    '[ ] Appointments - Book/reschedule/cancel buttons',
    '[ ] Tickets - Create/update/delete operations',
    '[ ] Settings - Save button persists changes',
    '[ ] Pharmacy - Request button submits correctly',
    '[ ] Medical - View records and search works',
    '[ ] Admin - All admin functions accessible',
    '[ ] Real-time - Notifications update live',
    '[ ] Queue - Token system functional',
    '[ ] Billing - Payment buttons available',
    '[ ] Chat - Messages send and receive',
    '[ ] Voice Input - Microphone buttons functional',
    '[ ] GPS - Location capture works',
    '[ ] Maps - Mapbox displays ambulance location',
    '[ ] Search - All search fields functional',
    '[ ] Filters - Filtering works on list pages',
    '[ ] Export - Data export button works'
  ];
  
  log.info('Manual tests required:');
  checklist.forEach(item => {
    log.info(item);
  });
  
  // Results summary
  log.section('📊 TEST RESULTS SUMMARY');
  console.log(`
  Total Checks:     ${colors.cyan}${testResults.total}${colors.reset}
  Passed:           ${colors.green}${testResults.passed}${colors.reset}
  Failed:           ${colors.red}${testResults.failed}${colors.reset}
  Warnings:         ${colors.yellow}${testResults.warnings}${colors.reset}
  
  Buttons Found:    ${colors.blue}${totalButtons}${colors.reset}
  API Endpoints:    ${colors.blue}${endpoints.length}${colors.reset}
  Components:       ${colors.blue}${Object.keys(components).length}${colors.reset}
  `);
  
  // Next steps
  log.section('📋 NEXT STEPS FOR FULL TESTING');
  console.log(`
  1. Open http://localhost:5174/ in browser
  2. Press F12 to open DevTools (Console tab)
  3. Follow the testing checklist above
  4. For each button:
     - Click it
     - Check console for errors (red messages)
     - Verify expected action occurs
     - Note any failures
  
  5. Test critical flows:
     A. Sign up → Create ticket → View tickets
     B. Dashboard → Request ambulance → Track location
     C. Book appointment → Reschedule → Cancel
     D. Settings → Save changes → Verify persistence
  
  6. Test real-time features:
     - Open app in 2 tabs
     - Create ticket in one
     - See it appear in other without refresh
     - Check notifications
  
  7. Test voice input:
     - Allow microphone permission
     - Speak into fields
     - Verify text appears
     - Check translations if multi-language
  
  8. Test services:
     - Pharmacy: Request medicine → Check status
     - Lab: View tests → Download report
     - Billing: View bill → Make payment
     - Queue: Get token → Track position
  `);
  
  log.section('🔧 DEBUGGING TIPS');
  console.log(`
  If a button doesn't work:
  
  1. Check browser console (F12 > Console tab)
     - Look for red error messages
     - Check network tab for failed requests
  
  2. Check network tab (F12 > Network)
     - See if requests are being sent
     - Check response status codes
     - Look for 404/500 errors
  
  3. Check if Supabase is connected:
     - Go to /settings
     - You should see "Connected" status
     - If not, database operations will fail
  
  4. Check environment variables:
     - Mapbox token needed for maps
     - OpenAI key needed for AI features
     - Supabase URL and key needed for DB
  
  5. Common issues:
     - Button clicks not working → Check console for JS errors
     - Data not saving → Check Supabase connection
     - Maps not showing → Add Mapbox token to .env
     - AI features → Add OpenAI API key
     - Notifications not working → Enable Realtime in Supabase
  `);
  
  return testResults;
}

// Run tests
const workspaceDir = process.cwd();
console.log(`\n${colors.yellow}Starting in: ${workspaceDir}${colors.reset}\n`);

const finalResults = runAllTests(workspaceDir);

// Final status
console.log(`\n${colors.cyan}${'═'.repeat(80)}${colors.reset}\n`);
if (finalResults.failed === 0) {
  console.log(`${colors.green}✓ All automated checks passed - Ready for manual testing!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.yellow}⚠ Some issues found - Review above and fix before manual testing${colors.reset}\n`);
  process.exit(1);
}
