/**
 * AI-AutoCoding-DAO
 * Main export file for the AI-AutoCoding-DAO system
 */

// Import logger
const logger = require('./utils/logger');

// Orchestration components
const TaskAnalyzer = require('./orchestration/analyzer');
const TokenTracker = require('./orchestration/token-tracker');
const TemplateManager = require('./orchestration/templates');

// Tool connectors
const ClaudeSonnetConnector = require('./tools/claude-sonnet-connector');
const BoltDiyConnector = require('./tools/bolt-diy-connector');

// Evaluation components
const QualityAnalyzer = require('./evaluation/quality-analyzer');
const ImplementationComparator = require('./evaluation/comparator');

/**
 * AI-AutoCoding-DAO system for optimizing AI-assisted development with Claude Sonnet
 */
class AIAutoCodingDAO {
  /**
   * Create a new AI-AutoCoding-DAO instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Initialize core components
    this.analyzer = new TaskAnalyzer();
    this.tokenTracker = new TokenTracker();
    this.templateManager = new TemplateManager();
    
    // Initialize evaluation framework
    this.qualityAnalyzer = new QualityAnalyzer();
    this.comparator = new ImplementationComparator(this.qualityAnalyzer);
    
    // Initialize tool connectors
    this.claudeSonnet = new ClaudeSonnetConnector(config.claudeSonnet);
    this.boltDiy = new BoltDiyConnector(config.boltDiy);
    
    logger.info('AI-AutoCoding-DAO initialized with Claude Sonnet integration');
  }
  
  /**
   * Process a task with the AI-AutoCoding-DAO system
   * @param {Object} task - Task to process
   * @returns {Promise<Object>} Processing results
   */
  async processTask(task) {
    try {
      logger.info(`Processing task: ${task.id || 'Unknown'}`);
      
      // Start tracking the task
      this.tokenTracker.startTask(task.id, task.description, task.complexity);
      
      // Analyze the task
      const analysis = this.analyzer.analyzeTask(task);
      logger.info(`Task analysis complete: ${task.id}`);
      
      // Get template for Claude Sonnet
      const templateType = this.templateManager.getBestTemplateType('claudeSonnet', task);
      const template = this.templateManager.getTemplate('claudeSonnet', templateType, task);
      
      if (!template) {
        throw new Error('Template not found for Claude Sonnet');
      }
      
      logger.info(`Using template: ${templateType}`);
      
      // Track token usage for analysis phase
      const analysisTokens = this._estimateTokens(JSON.stringify(analysis) + template);
      
      // Implement the task using Claude Sonnet
      logger.info(`Implementing task with Claude Sonnet`);
      const implementation = await this.claudeSonnet.implementTask(task, template);
      
      // Execute implementation with bolt.diy
      logger.info(`Executing implementation with bolt.diy`);
      const execution = await this.boltDiy.executeTask(task, implementation);
      
      // Track token usage
      this.tokenTracker.recordDelegatedCost(task.id, 'claudeSonnet', {
        analysis: analysisTokens,
        delegation: implementation.tokenUsage?.prompt || 0,
        review: implementation.tokenUsage?.completion || 0,
        timeSpent: (Date.now() - this.tokenTracker.tasks.get(task.id).startTime) / 60000 // minutes
      });
      
      // Analyze implementation quality
      const quality = this.qualityAnalyzer.analyzeQuality(implementation, task);
      
      // Mark task as complete
      this.tokenTracker.completeTask(task.id, quality.overallScore);
      
      // Calculate efficiency
      const efficiency = this.tokenTracker.compareEfficiency(task.id);
      
      return {
        taskId: task.id,
        task,
        analysis,
        implementation,
        execution,
        quality,
        efficiency,
        template: {
          type: templateType,
          content: template
        }
      };
    } catch (error) {
      logger.error(`Task processing failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Compare implementations
   * @param {Object} task - Original task
   * @param {Object[]} implementations - Implementations to compare
   * @returns {Object} Comparison results
   */
  compareImplementations(task, implementations) {
    return this.comparator.compareImplementations(implementations, task);
  }
  
  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStats() {
    return this.tokenTracker.getStats();
  }
  
  /**
   * Get visualization data
   * @returns {Object} Visualization-ready data
   */
  getVisualizationData() {
    return this.tokenTracker.getVisualizationData();
  }
  
  /**
   * Estimate token count for a string
   * @private
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  _estimateTokens(text) {
    // Very simple token estimation - about 4 characters per token on average
    return Math.ceil((text || '').length / 4);
  }
}

module.exports = {
  AIAutoCodingDAO,
  TaskAnalyzer,
  TokenTracker,
  TemplateManager,
  QualityAnalyzer,
  ImplementationComparator,
  ClaudeSonnetConnector,
  BoltDiyConnector
};