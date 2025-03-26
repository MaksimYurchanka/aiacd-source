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
const MetricsCollector = require('./dashboard/metrics-collector');

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
    this.metricsCollector = new MetricsCollector();
    
    // Initialize evaluation framework
    this.qualityAnalyzer = new QualityAnalyzer();
    this.comparator = new ImplementationComparator(this.qualityAnalyzer);
    
    // Initialize tool connectors
    this.claudeSonnet = new ClaudeSonnetConnector(config.claudeSonnet);
    this.boltDiy = new BoltDiyConnector(config.boltDiy);
    
    // Store configuration
    this.config = {
      devMode: config.devMode || process.env.NODE_ENV === 'development',
      ...config
    };
    
    logger.info('AI-AutoCoding-DAO initialized');
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
      
      // Select tool and template based on mode
      const toolName = this.config.devMode ? 'boltDiy' : 'claudeSonnet';
      const tool = this.config.devMode ? this.boltDiy : this.claudeSonnet;
      
      // Get template
      const templateType = this.templateManager.getBestTemplateType(toolName, task);
      const template = this.templateManager.getTemplate(toolName, templateType, task);
      
      if (!template) {
        throw new Error(`Template not found for ${toolName}`);
      }
      
      logger.info(`Using template: ${templateType} with ${toolName}`);
      
      // Track token usage for analysis phase
      const analysisTokens = this._estimateTokens(JSON.stringify(analysis) + template);
      
      // Implement the task
      logger.info(`Implementing task with ${toolName}`);
      const implementation = await tool.implementTask(task, template);
      
      // Execute implementation
      logger.info(`Executing implementation`);
      const execution = await this.boltDiy.executeTask(task, implementation);
      
      // Track token usage
      this.tokenTracker.recordDelegatedCost(task.id, toolName, {
        analysis: analysisTokens,
        delegation: implementation.tokenUsage?.prompt || 0,
        review: implementation.tokenUsage?.completion || 0,
        timeSpent: (Date.now() - this.tokenTracker.tasks.get(task.id).startTime) / 60000
      });
      
      // Analyze implementation quality
      const quality = this.qualityAnalyzer.analyzeQuality(implementation, task);
      
      // Record metrics
      this.metricsCollector.recordTaskMetrics(task, {
        ...implementation,
        quality,
        success: true
      });
      
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
      
      // Record failure metrics
      if (task.id) {
        this.metricsCollector.recordTaskMetrics(task, {
          success: false,
          error: error.message
        });
      }
      
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
    return {
      tokenTracking: this.tokenTracker.getStats(),
      metrics: this.metricsCollector.generateReport()
    };
  }
  
  /**
   * Get visualization data
   * @returns {Object} Visualization-ready data
   */
  getVisualizationData() {
    return {
      tokenTracking: this.tokenTracker.getVisualizationData(),
      metrics: this.metricsCollector.getVisualizationData()
    };
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
  BoltDiyConnector,
  MetricsCollector
};