#!/usr/bin/env node

require('dotenv').config();
const { AIAutoCodingDAO } = require('../src');

// Development mode configuration
const devConfig = {
  claudeSonnet: {
    devMode: true
  },
  boltDiy: {
    devMode: true
  }
};

// Initialize the system with development mode if no API keys are present
const config = !process.env.CLAUDE_API_KEY ? devConfig : {};
const aiacd = new AIAutoCodingDAO(config);

// Example task for testing
const exampleTask = {
  id: 'example-task',
  description: 'Create a simple button component with hover effects',
  type: 'ui',
  complexity: 'low',
  features: ['component', 'interaction']
};

console.log('\nAI-AutoCoding-DAO Development Environment');
console.log('----------------------------------------');

if (!process.env.CLAUDE_API_KEY) {
  console.log('\n⚠️  Running in development mode (no API keys required)');
  console.log('   Implementations will be simulated for testing purposes');
} else {
  console.log('\n🔑 Running in production mode with Claude Sonnet API');
}

console.log('\nExample task:');
console.log(JSON.stringify(exampleTask, null, 2));

// Process the example task
aiacd.processTask(exampleTask)
  .then(result => {
    console.log('\nTask processing complete!');
    console.log(`Quality Score: ${result.quality.overallScore}/10`);
    console.log(`Token Efficiency: ${result.efficiency.efficiencyGain}`);
  })
  .catch(error => {
    console.error('\nError processing task:', error.message);
  });