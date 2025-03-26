/**
 * AI-AutoCoding-DAO Task Analyzer
 * Analyzes task descriptions to extract key characteristics for tool selection
 */
class TaskAnalyzer {
  constructor() {
    // Feature detection patterns
    this.featurePatterns = {
      stateManagement: [
        'state management', 'state', 'redux', 'context', 
        'useState', 'useReducer', 'store'
      ],
      asyncOperations: [
        'async', 'promise', 'fetch', 'api', 'http', 
        'request', 'useEffect', 'axios'
      ],
      accessibility: [
        'a11y', 'accessibility', 'wcag', 'aria', 'screen reader', 
        'keyboard navigation', 'focus management'
      ],
      animations: [
        'animation', 'transition', 'motion', 'keyframe', 
        'transform', 'animate'
      ],
      validation: [
        'validation', 'validate', 'form validation', 'input validation', 
        'error checking', 'sanitize'
      ],
      typescript: [
        'typescript', 'typed', 'type-safe', 'interface', 
        'type definition', 'generics'
      ],
      responsiveDesign: [
        'responsive', 'mobile', 'tablet', 'breakpoint', 
        'media query', 'adaptive'
      ]
    };
    
    // Component type patterns
    this.componentPatterns = {
      ui: [
        'ui', 'component', 'interface', 'view', 'page', 
        'form', 'button', 'input', 'modal', 'card'
      ],
      logic: [
        'function', 'utility', 'helper', 'algorithm', 'processor',
        'hook', 'service', 'calculation', 'transformation'
      ],
      design: [
        'design', 'system', 'theme', 'style', 'pattern',
        'visual', 'layout', 'ui kit', 'component library'
      ]
    };

    // Complexity indicators
    this.complexityIndicators = {
      high: [
        'complex', 'advanced', 'sophisticated', 'comprehensive',
        'enterprise', 'large-scale', 'multi-step', 'intricate'
      ],
      low: [
        'simple', 'basic', 'minimal', 'straightforward',
        'small', 'single', 'elementary', 'starter'
      ]
    };
  }

  /**
   * Analyze a task description to determine key characteristics
   * @param {Object} task - The task to analyze
   * @returns {Object} Analysis results
   */
  analyzeTask(task) {
    return {
      type: this.determineTaskType(task),
      complexity: this.assessComplexity(task),
      features: this.detectFeatures(task),
      estimatedLines: this.estimateCodeLines(task),
      tokenBudget: this.estimateTokenBudget(task)
    };
  }

  /**
   * Determine the type of task (ui, logic, design)
   * @param {Object} task - The task to analyze
   * @returns {string} Task type
   */
  determineTaskType(task) {
    const description = task.description.toLowerCase();
    
    for (const [type, patterns] of Object.entries(this.componentPatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        return type;
      }
    }
    
    // Default to UI if no specific type is detected
    return 'ui';
  }

  /**
   * Assess the complexity of the task
   * @param {Object} task - The task to analyze
   * @returns {string} Complexity level (low, medium, high)
   */
  assessComplexity(task) {
    const description = task.description.toLowerCase();
    
    // Check for explicit complexity indicators
    for (const [level, indicators] of Object.entries(this.complexityIndicators)) {
      if (indicators.some(indicator => description.includes(indicator))) {
        return level;
      }
    }
    
    // Calculate complexity based on features
    const features = this.detectFeatures(task);
    
    // Scoring system for features
    const complexityScore = features.reduce((score, feature) => {
      switch (feature) {
        case 'stateManagement':
        case 'asyncOperations':
          return score + 2;
        case 'accessibility':
        case 'animations':
        case 'validation':
        case 'typescript':
        case 'responsiveDesign':
          return score + 1;
        default:
          return score;
      }
    }, 0);
    
    // Determine complexity level based on score
    if (complexityScore <= 2) return 'low';
    if (complexityScore <= 5) return 'medium';
    return 'high';
  }

  /**
   * Detect features required by the task
   * @param {Object} task - The task to analyze
   * @returns {string[]} Array of detected features
   */
  detectFeatures(task) {
    const description = task.description.toLowerCase();
    const features = [];
    
    for (const [feature, patterns] of Object.entries(this.featurePatterns)) {
      if (patterns.some(pattern => description.includes(pattern))) {
        features.push(feature);
      }
    }
    
    return features;
  }

  /**
   * Estimate the number of code lines required for the task
   * @param {Object} task - The task to analyze
   * @returns {number} Estimated lines of code
   */
  estimateCodeLines(task) {
    const type = this.determineTaskType(task);
    const complexity = this.assessComplexity(task);
    
    // Base lines by type
    const baseLines = {
      ui: 50,
      logic: 30,
      design: 80
    }[type] || 40;
    
    // Multiplier by complexity
    const complexityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.5
    }[complexity] || 1.0;
    
    // Additional lines for features
    const features = this.detectFeatures(task);
    const featureLines = features.reduce((lines, feature) => {
      switch (feature) {
        case 'stateManagement':
          return lines + 20;
        case 'asyncOperations':
          return lines + 15;
        case 'validation':
          return lines + 10;
        case 'accessibility':
        case 'animations':
        case 'typescript':
        case 'responsiveDesign':
          return lines + 5;
        default:
          return lines;
      }
    }, 0);
    
    return Math.round((baseLines * complexityMultiplier) + featureLines);
  }

  /**
   * Estimate token budget required for the task
   * @param {Object} task - The task to analyze
   * @returns {Object} Token budget for different phases
   */
  estimateTokenBudget(task) {
    const linesOfCode = this.estimateCodeLines(task);
    
    // Calculate token budget based on estimated lines of code
    // Assumption: 1 line of code requires approximately 10 tokens
    const codeTokens = linesOfCode * 10;
    
    // Token budgets for different phases
    return {
      analysis: Math.round(codeTokens * 0.2),  // 20% for analysis
      implementation: Math.round(codeTokens * 0.6),  // 60% for implementation
      review: Math.round(codeTokens * 0.2),  // 20% for review
      total: codeTokens
    };
  }
}

module.exports = TaskAnalyzer;
