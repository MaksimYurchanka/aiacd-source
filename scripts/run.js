#!/usr/bin/env node

require('dotenv').config();
const { AIAutoCodingDAO } = require('../src');

// Initialize the system
const aiacd = new AIAutoCodingDAO();

console.log('AI-AutoCoding-DAO is running');
console.log('Use the API to process tasks and analyze results');

// Example task
const exampleTask = {
  id: 'example-task',
  description: 'Create a simple button component with hover effects',
  type: 'ui',
  complexity: 'low',
  features: ['component', 'interaction']
};

console.log('\nExample task:');
console.log(JSON.stringify(exampleTask, null, 2));

// To process the task, uncomment:
// aiacd.processTask(exampleTask).then(result => console.log(result));
