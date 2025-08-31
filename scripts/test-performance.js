#!/usr/bin/env node

/**
 * Performance Testing Script
 * Measures animation performance metrics for the optimized portfolio
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const PAGES_TO_TEST = [
  { name: 'Home', url: 'http://localhost:3000', scrollPositions: [0, 500, 1000] },
  { name: 'Resume', url: 'http://localhost:3000#resume', scrollPositions: [0, 300, 600] },
  { name: 'Projects', url: 'http://localhost:3000#projects', scrollPositions: [0, 400, 800] },
];

const METRICS_TO_COLLECT = [
  'FPS',
  'ScriptDuration',
  'LayoutDuration',
  'RecalcStyleDuration',
  'PaintDuration',
  'CompositeDuration',
  'JSHeapUsedSize',
  'JSHeapTotalSize',
];

async function measurePerformance() {
  console.log('🚀 Starting Performance Tests...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const results = {};

  try {
    for (const pageTest of PAGES_TO_TEST) {
      console.log(`📊 Testing ${pageTest.name} page...`);
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Enable performance metrics
      await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = [];
        
        // Override requestAnimationFrame to measure FPS
        let frameCount = 0;
        let lastTime = performance.now();
        const originalRAF = window.requestAnimationFrame;
        
        window.requestAnimationFrame = function(callback) {
          return originalRAF.call(window, function(timestamp) {
            frameCount++;
            const currentTime = performance.now();
            if (currentTime - lastTime >= 1000) {
              window.performanceMetrics.push({
                type: 'FPS',
                value: frameCount,
                timestamp: currentTime
              });
              frameCount = 0;
              lastTime = currentTime;
            }
            callback(timestamp);
          });
        };
      });

      // Navigate to page
      await page.goto(pageTest.url, { waitUntil: 'networkidle2' });
      
      // Wait for animations to start
      await page.waitForTimeout(2000);
      
      const pageMetrics = [];
      
      // Test different scroll positions
      for (const scrollY of pageTest.scrollPositions) {
        console.log(`  📍 Scroll position: ${scrollY}px`);
        
        // Smooth scroll to position
        await page.evaluate((y) => {
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, scrollY);
        
        // Wait for scroll animation
        await page.waitForTimeout(1500);
        
        // Collect metrics
        const metrics = await page.metrics();
        const performanceMetrics = await page.evaluate(() => {
          const entries = performance.getEntriesByType('measure');
          const paint = performance.getEntriesByType('paint');
          return {
            measures: entries.map(e => ({ name: e.name, duration: e.duration })),
            paints: paint.map(p => ({ name: p.name, startTime: p.startTime })),
            memory: performance.memory ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null,
            customMetrics: window.performanceMetrics || []
          };
        });
        
        pageMetrics.push({
          scrollPosition: scrollY,
          metrics,
          performanceMetrics,
          timestamp: Date.now()
        });
      }
      
      // Test animation smoothness
      console.log('  🎬 Testing animation smoothness...');
      const animationMetrics = await page.evaluate(async () => {
        const results = {
          droppedFrames: 0,
          totalFrames: 0,
          avgFPS: 0
        };
        
        return new Promise((resolve) => {
          let frames = 0;
          let droppedFrames = 0;
          let lastTime = performance.now();
          const targetFPS = 60;
          const targetFrameTime = 1000 / targetFPS;
          
          function measureFrame(timestamp) {
            frames++;
            const deltaTime = timestamp - lastTime;
            
            if (deltaTime > targetFrameTime * 1.5) {
              droppedFrames++;
            }
            
            lastTime = timestamp;
            
            if (frames < 300) { // Measure for ~5 seconds at 60fps
              requestAnimationFrame(measureFrame);
            } else {
              results.totalFrames = frames;
              results.droppedFrames = droppedFrames;
              results.avgFPS = Math.round((frames / 5) * 10) / 10;
              resolve(results);
            }
          }
          
          requestAnimationFrame(measureFrame);
        });
      });
      
      results[pageTest.name] = {
        url: pageTest.url,
        metrics: pageMetrics,
        animationMetrics
      };
      
      await page.close();
    }
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: generateSummary(results)
    };
    
    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📈 Performance Test Summary:');
    console.log('================================\n');
    
    for (const [pageName, data] of Object.entries(results)) {
      console.log(`${pageName} Page:`);
      console.log(`  • Average FPS: ${data.animationMetrics.avgFPS}`);
      console.log(`  • Dropped Frames: ${data.animationMetrics.droppedFrames}/${data.animationMetrics.totalFrames} (${Math.round((data.animationMetrics.droppedFrames / data.animationMetrics.totalFrames) * 100)}%)`);
      
      const avgHeapSize = data.metrics.reduce((sum, m) => {
        return sum + (m.metrics.JSHeapUsedSize || 0);
      }, 0) / data.metrics.length;
      
      console.log(`  • Avg Memory Usage: ${Math.round(avgHeapSize / 1024 / 1024)}MB`);
      console.log('');
    }
    
    console.log(`✅ Report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during performance testing:', error);
  } finally {
    await browser.close();
  }
}

function generateSummary(results) {
  const summary = {
    overallFPS: 0,
    totalDroppedFrames: 0,
    totalFrames: 0,
    avgMemoryUsage: 0,
    recommendations: []
  };
  
  let totalFPS = 0;
  let pageCount = 0;
  
  for (const data of Object.values(results)) {
    totalFPS += data.animationMetrics.avgFPS;
    summary.totalDroppedFrames += data.animationMetrics.droppedFrames;
    summary.totalFrames += data.animationMetrics.totalFrames;
    pageCount++;
  }
  
  summary.overallFPS = Math.round((totalFPS / pageCount) * 10) / 10;
  
  // Generate recommendations
  if (summary.overallFPS < 30) {
    summary.recommendations.push('Critical: FPS is below 30. Consider disabling complex animations on low-end devices.');
  } else if (summary.overallFPS < 50) {
    summary.recommendations.push('Warning: FPS is below 50. Some animations may feel sluggish.');
  } else {
    summary.recommendations.push('Good: FPS is above 50. Animations should feel smooth.');
  }
  
  const droppedFrameRatio = summary.totalDroppedFrames / summary.totalFrames;
  if (droppedFrameRatio > 0.1) {
    summary.recommendations.push('Warning: More than 10% of frames are being dropped. Consider optimizing animations.');
  }
  
  return summary;
}

// Check if puppeteer is installed
async function checkDependencies() {
  try {
    require.resolve('puppeteer');
    return true;
  } catch (e) {
    console.log('📦 Installing puppeteer for performance testing...');
    const { execSync } = require('child_process');
    execSync('npm install --save-dev puppeteer', { stdio: 'inherit' });
    return true;
  }
}

// Main execution
(async () => {
  await checkDependencies();
  await measurePerformance();
})();
