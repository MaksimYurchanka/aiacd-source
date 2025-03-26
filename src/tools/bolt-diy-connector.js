/**
 * AI-AutoCoding-DAO bolt.diy Connector
 * Handles integration with bolt.diy for task execution and management
 */
const logger = require('../utils/logger');

class BoltDiyConnector {
  constructor(config = {}) {
    this.name = 'boltDiy';
    this.displayName = 'bolt.diy';
    
    this.config = {
      url: config.url || process.env.BOLT_DIY_URL,
      apiKey: config.apiKey || process.env.BOLT_DIY_API_KEY,
      ...config
    };
    
    // Validate config
    if (!this.config.url || !this.config.apiKey) {
      logger.error('Missing required bolt.diy configuration');
      throw new Error('bolt.diy URL and API key are required');
    }
  }

  /**
   * Execute a task using bolt.diy
   * @param {Object} task - Task details
   * @param {Object} implementation - Claude Sonnet implementation
   * @returns {Promise<Object>} Execution results
   */
  async executeTask(task, implementation) {
    try {
      logger.info(`Executing task with bolt.diy: ${task.id}`);
      
      // Prepare the execution request
      const request = this._prepareRequest(task, implementation);
      
      // Make API call to bolt.diy
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`bolt.diy API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        result,
        metadata: {
          tool: this.name,
          timestamp: new Date().toISOString(),
          taskId: task.id
        }
      };
    } catch (error) {
      logger.error(`bolt.diy execution failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Prepare request for bolt.diy
   * @private
   * @param {Object} task - Task details
   * @param {Object} implementation - Claude Sonnet implementation
   * @returns {Object} Prepared request
   */
  _prepareRequest(task, implementation) {
    return {
      taskId: task.id,
      description: task.description,
      implementation: implementation.implementation,
      metadata: {
        type: task.type,
        complexity: task.complexity,
        features: task.features
      },
      config: {
        timeout: 30000, // 30 second timeout
        retries: 3
      }
    };
  }
  
  /**
   * Get execution status from bolt.diy
   * @param {string} taskId - Task identifier
   * @returns {Promise<Object>} Execution status
   */
  async getExecutionStatus(taskId) {
    try {
      const response = await fetch(`${this.config.url}/status/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`bolt.diy API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`Failed to get execution status: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BoltDiyConnector;