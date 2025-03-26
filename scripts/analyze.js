#!/usr/bin/env node

require('dotenv').config();
const { TokenTracker } = require('../src');

// Create a token tracker instance
const tokenTracker = new TokenTracker();

// Add some example data
tokenTracker.startTask('example-task-1', 'Create a login form component', 'medium');
tokenTracker.recordDirectCost('example-task-1', 1000, 30);
tokenTracker.recordDelegatedCost('example-task-1', 'claudeDirect', {
  analysis: 100,
  delegation: 300,
  review: 200,
  timeSpent: 10
});
tokenTracker.completeTask('example-task-1', 8.5);

tokenTracker.startTask('example-task-2', 'Create a data visualization component', 'high');
tokenTracker.recordDirectCost('example-task-2', 1500, 45);
tokenTracker.recordDelegatedCost('example-task-2', 'haiku', {
  analysis: 150,
  delegation: 400,
  review: 250,
  timeSpent: 15
});
tokenTracker.completeTask('example-task-2', 9.0);

// Print statistics
console.log('Token Efficiency Statistics:');
console.log(JSON.stringify(tokenTracker.getStats(), null, 2));

console.log('\nVisualization Data:');
console.log(JSON.stringify(tokenTracker.getVisualizationData(), null, 2));
