#!/usr/bin/env node

require('dotenv').config();
const { BoltDiyConnector } = require('../src/tools/bolt-diy-connector');
const logger = require('../src/utils/logger');

async function testBoltDiy() {
  try {
    logger.info('Testing bolt.diy integration...');

    // Initialize connector
    const boltDiy = new BoltDiyConnector();

    // Test task
    const task = {
      id: 'test-task-001',
      description: 'Create a simple React button component',
      type: 'ui',
      complexity: 'low',
      features: ['component', 'interaction']
    };

    // Test implementation
    const implementation = {
      implementation: `
function Button({ children, onClick }) {
  return (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
      files: [{
        name: 'Button.jsx',
        content: 'export default Button;',
        type: 'text/javascript'
      }]
    };

    // Execute task
    logger.info('Executing test task...');
    const result = await boltDiy.executeTask(task, implementation);

    logger.info('Execution result:', result);

    if (result.success) {
      logger.info('Test passed successfully!');
    } else {
      throw new Error('Test failed: Execution was not successful');
    }

    // Test file operations if not in dev mode
    if (!boltDiy.config.devMode) {
      logger.info('Testing file operations...');
      
      // Download the uploaded files
      const files = await boltDiy.downloadProjectFiles(task.id);
      logger.info('Downloaded files:', files);
    }

  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testBoltDiy();