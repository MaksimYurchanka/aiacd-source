/**
 * AI-AutoCoding-DAO Task Processor
 * Processes tasks for bolt.diy integration
 */
const logger = require('../utils/logger');
const PromptBuilder = require('./prompt-builder');
const { validateTask } = require('../utils/validation');

class TaskProcessor {
  constructor(templateManager, boltDiy) {
    this.templateManager = templateManager;
    this.boltDiy = boltDiy;
    this.promptBuilder = new PromptBuilder();
    
    // Metrics tracking
    this.metrics = {
      processed: 0,
      successful: 0,
      failed: 0,
      averageTokens: 0,
      totalTokens: 0
    };
  }

  /**
   * Process a task through the pipeline
   * @param {Object} task - Task to process
   * @returns {Promise<Object>} Processing results
   */
  async processTask(task) {
    try {
      logger.info(`Processing task: ${task.id}`);
      
      // Validate task
      const validation = validateTask(task);
      if (!validation.valid) {
        throw new Error(`Invalid task: ${JSON.stringify(validation.errors)}`);
      }

      // Get template
      const templateType = this.templateManager.getBestTemplateType('boltDiy', task);
      const template = this.templateManager.getTemplate('boltDiy', templateType, task);
      
      if (!template) {
        throw new Error('No suitable template found');
      }

      // Build prompt
      const prompt = this.promptBuilder.buildPrompt(task, template);
      
      // Execute with bolt.diy
      const result = await this.boltDiy.executeTask(task, {
        implementation: prompt,
        metadata: {
          type: task.type,
          complexity: task.complexity,
          features: task.features
        }
      });

      // Process output
      const processed = this.promptBuilder.processOutput(result.result, task);

      // Update metrics
      this._updateMetrics(result);

      return {
        success: true,
        implementation: processed.implementation,
        explanation: processed.explanation,
        metadata: {
          ...processed.metadata,
          tokenUsage: result.tokenUsage,
          quality: result.quality
        }
      };
    } catch (error) {
      logger.error(`Task processing failed: ${error.message}`);
      
      // Update failure metrics
      this.metrics.processed++;
      this.metrics.failed++;
      
      throw error;
    }
  }

  /**
   * Get current processing metrics
   * @returns {Object} Current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.processed > 0 ? 
        (this.metrics.successful / this.metrics.processed * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Update metrics with task results
   * @private
   * @param {Object} result - Task execution result
   */
  _updateMetrics(result) {
    this.metrics.processed++;
    this.metrics.successful++;
    
    if (result.tokenUsage) {
      const tokens = result.tokenUsage.total || 0;
      this.metrics.totalTokens += tokens;
      this.metrics.averageTokens = this.metrics.totalTokens / this.metrics.successful;
    }
  }
}

module.exports = TaskProcessor;