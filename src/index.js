/**
 * AI-AutoCoding-DAO
 * Main export file for the AI-AutoCoding-DAO system
 */

// Orchestration components
const ToolSelector = require('./orchestration/selector');
const TaskAnalyzer = require('./orchestration/analyzer');
const TokenTracker = require('./orchestration/token-tracker');
const TemplateManager = require('./orchestration/templates');

// Tool connectors
const ClaudeDirectConnector = require('./tools/claude-direct');

// Evaluation components
const QualityAnalyzer = require('./evaluation/quality-analyzer');
const ImplementationComparator = require('./evaluation/comparator');

/**
 * AI-AutoCoding-DAO system for optimizing AI-assisted development
 */
class AIAutoCodingDAO {
  /**
   * Create a new AI-AutoCoding-DAO instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Initialize core components
    this.analyzer = new TaskAnalyzer();
    this.selector = new ToolSelector();
    this.tokenTracker = new TokenTracker();
    this.templateManager = new TemplateManager();
    
    // Initialize evaluation framework
    this.qualityAnalyzer = new QualityAnalyzer();
    this.comparator = new ImplementationComparator(this.qualityAnalyzer);
    
    // Initialize tool connectors
    this.tools = {
      claudeDirect: new ClaudeDirectConnector(config.claudeDirect)
    };
    
    // Add other tool connectors as they become available
    
    // System initialization message
    console.log('AI-AutoCoding-DAO initialized');
  }
  
  /**
   * Process a task with the AI-AutoCoding-DAO system
   * @param {Object} task - Task to process
   * @returns {Promise<Object>} Processing results
   */
  async processTask(task) {
    try {
      console.log(`Processing task: ${task.id || 'Unknown'}`);
      
      // Start tracking the task
      this.tokenTracker.startTask(task.id, task.description, task.complexity);
      
      // Analyze the task
      const analysis = this.analyzer.analyzeTask(task);
      console.log(`Task analysis complete: ${task.id}`);
      
      // Select the optimal tool
      const toolSelection = this.selector.selectTool({
        ...task,
        ...analysis
      });
      console.log(`Selected tool: ${toolSelection.selectedTool}`);
      
      // Get the tool connector
      const selectedTool = toolSelection.selectedTool;
      const toolConnector = this.tools[selectedTool];
      
      if (!toolConnector) {
        throw new Error(`Tool connector not found for ${selectedTool}`);
      }
      
      // Get a template for the selected tool
      const templateType = this.templateManager.getBestTemplateType(selectedTool, task);
      const template = this.templateManager.getTemplate(selectedTool, templateType, task);
      
      if (!template) {
        throw new Error(`Template not found for ${selectedTool}`);
      }
      
      console.log(`Using template: ${templateType}`);
      
      // Track token usage for analysis phase
      const analysisTokens = this._estimateTokens(JSON.stringify(analysis) + template);
      
      // Implement the task using the selected tool
      console.log(`Implementing task with ${selectedTool}`);
      const implementation = await toolConnector.implementTask(task, template);
      
      // Track token usage for implementation
      this.tokenTracker.recordDelegatedCost(task.id, selectedTool, {
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
        toolSelection,
        implementation,
        quality,
        efficiency,
        template: {
          type: templateType,
          content: template
        }
      };
    } catch (error) {
      console.error(`Task processing failed: ${error.message}`);
      return {
        taskId: task.id,
        task,
        error: error.message,
        success: false
      };
    }
  }
  
  /**
   * Compare implementations from different tools
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
    // A real implementation would use a proper tokenizer
    return Math.ceil((text || '').length / 4);
  }
}

module.exports = {
  AIAutoCodingDAO,
  ToolSelector,
  TaskAnalyzer,
  TokenTracker,
  TemplateManager,
  QualityAnalyzer,
  ImplementationComparator,
  ClaudeDirectConnector
};
