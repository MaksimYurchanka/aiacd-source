/**
 * AI-AutoCoding-DAO Task Analyzer
 * Analyzes tasks for optimal Claude Sonnet implementation
 */
const logger = require('../utils/logger');

class TaskAnalyzer {
  constructor() {
    // Feature detection patterns
    this.featurePatterns = {
      stateManagement: [
        'state', 'store', 'context', 'reducer',
        'useState', 'useReducer'
      ],
      asyncOperations: [
        'async', 'promise', 'fetch', 'api',
        'request', 'useEffect'
      ],
      accessibility: [
        'a11y', 'accessibility', 'wcag', 'aria',
        'keyboard navigation'
      ],
      validation: [
        'validation', 'validate', 'form',
        'input', 'sanitize'
      ],
      typescript: [
        'typescript', 'type-safe', 'interface',
        'type definition'
      ]
    };

    // Task type patterns
    this.typePatterns = {
      ui: [
        'ui', 'component', 'interface', 'view',
        'form', 'button', 'input'
      ],
      logic: [
        'function', 'utility', 'algorithm',
        'hook', 'service', 'calculation'
      ]
    };
  }

  /**
   * Analyze a task for Claude Sonnet implementation
   * @param {Object} task - The task to analyze
   * @returns {Object} Analysis results
   */
  analyzeTask(task) {
    try {
      logger.info(`Analyzing task: ${task.id || 'Unknown'}`);

      const analysis = {
        type: this.determineTaskType(task),
        complexity: this.assessComplexity(task),
        features: this.detectFeatures(task),
        tokenBudget: this.estimateTokenBudget(task),
        recommendations: this.generateRecommendations(task)
      };

      logger.debug('Task analysis complete', analysis);
      return analysis;
    } catch (error) {
      logger.error(`Task analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Determine the type of task
   * @param {Object} task - The task to analyze
   * @returns {string} Task type
   */
  determineTaskType(task) {
    const description = task.description?.toLowerCase() || '';
    
    for (const [type, patterns] of Object.entries(this.typePatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        return type;
      }
    }
    
    return 'ui';
  }

  /**
   * Assess the complexity of the task
   * @param {Object} task - The task to analyze
   * @returns {string} Complexity level
   */
  assessComplexity(task) {
    const features = this.detectFeatures(task);
    
    // Calculate complexity based on features
    const complexityScore = features.reduce((score, feature) => {
      switch (feature) {
        case 'stateManagement':
        case 'asyncOperations':
          return score + 2;
        case 'accessibility':
        case 'validation':
        case 'typescript':
          return score + 1;
        default:
          return score;
      }
    }, 0);
    
    if (complexityScore <= 2) return 'low';
    if (complexityScore <= 5) return 'medium';
    return 'high';
  }

  /**
   * Detect required features
   * @param {Object} task - The task to analyze
   * @returns {string[]} Detected features
   */
  detectFeatures(task) {
    const description = task.description?.toLowerCase() || '';
    const features = [];
    
    for (const [feature, patterns] of Object.entries(this.featurePatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        features.push(feature);
      }
    }
    
    return features;
  }

  /**
   * Estimate token budget for the task
   * @param {Object} task - The task to analyze
   * @returns {Object} Token budget
   */
  estimateTokenBudget(task) {
    const complexity = this.assessComplexity(task);
    const features = this.detectFeatures(task);
    
    // Base budget by complexity
    const baseBudget = {
      low: 1000,
      medium: 2000,
      high: 3000
    }[complexity] || 2000;
    
    // Additional budget for features
    const featureBudget = features.reduce((total, feature) => {
      const budgets = {
        stateManagement: 500,
        asyncOperations: 400,
        accessibility: 300,
        validation: 300,
        typescript: 200
      };
      return total + (budgets[feature] || 0);
    }, 0);
    
    const total = baseBudget + featureBudget;
    
    return {
      total,
      analysis: Math.round(total * 0.2),
      implementation: Math.round(total * 0.6),
      review: Math.round(total * 0.2)
    };
  }

  /**
   * Generate implementation recommendations
   * @param {Object} task - The task to analyze
   * @returns {string[]} Recommendations
   */
  generateRecommendations(task) {
    const recommendations = [];
    const features = this.detectFeatures(task);
    const complexity = this.assessComplexity(task);
    
    // Add general recommendations
    recommendations.push('Use clear and descriptive variable names');
    recommendations.push('Include comprehensive error handling');
    recommendations.push('Add detailed comments for complex logic');
    
    // Feature-specific recommendations
    if (features.includes('stateManagement')) {
      recommendations.push('Implement efficient state management patterns');
    }
    
    if (features.includes('asyncOperations')) {
      recommendations.push('Use async/await for better readability');
      recommendations.push('Implement proper error handling for async operations');
    }
    
    if (features.includes('accessibility')) {
      recommendations.push('Follow WCAG 2.1 guidelines');
      recommendations.push('Implement proper ARIA attributes');
    }
    
    // Complexity-specific recommendations
    if (complexity === 'high') {
      recommendations.push('Break down complex logic into smaller functions');
      recommendations.push('Consider implementing unit tests');
    }
    
    return recommendations;
  }
}

module.exports = TaskAnalyzer;