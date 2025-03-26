/**
 * AI-AutoCoding-DAO Tool Selector
 * Determines the optimal AI tool for a given coding task based on analysis
 */
class ToolSelector {
  constructor() {
    // Tool characteristics based on analysis
    this.toolProfiles = {
      haiku: {
        name: "Haiku",
        maxLines: 100,
        minLines: 20,
        strengths: ['logic', 'data-processing', 'algorithms', 'utilities'],
        optimalComplexity: 'medium',
        tokenEfficiency: 0.8, // Token usage efficiency (0-1)
        specialties: {
          customHooks: 1.0,
          errorHandling: 0.9,
          accessibility: 0.9,
          stateManagement: 0.85
        }
      },
      boltNew: {
        name: "Bolt.new",
        maxLines: 300,
        minLines: 50,
        strengths: ['ui-components', 'forms', 'layouts', 'interactions'],
        optimalComplexity: 'medium',
        tokenEfficiency: 0.75,
        specialties: {
          typescript: 0.95,
          componentArchitecture: 0.9,
          uiPatterns: 0.85,
          responsiveDesign: 0.9
        }
      },
      v0Dev: {
        name: "v0.dev",
        maxLines: 500,
        minLines: 100,
        strengths: ['design-systems', 'themes', 'style-guides', 'patterns'],
        optimalComplexity: 'high',
        tokenEfficiency: 0.7,
        specialties: {
          designSystems: 1.0,
          themeManagement: 0.95,
          visualConsistency: 0.9,
          componentLibrary: 0.85
        }
      },
      claudeDirect: {
        name: "Claude Direct",
        maxLines: 150,
        minLines: 0,
        strengths: ['quick-prototypes', 'simple-components', 'basic-functions'],
        optimalComplexity: 'low',
        tokenEfficiency: 1.0,
        specialties: {
          rapidPrototyping: 0.95,
          simpleFunctions: 0.9,
          basicComponents: 0.85,
          quickFixes: 1.0
        }
      }
    };
  }

  /**
   * Analyze a task to determine its key characteristics
   * @param {Object} task - The task to analyze
   * @returns {Object} Task analysis results
   */
  analyzeTask(task) {
    return {
      estimatedLines: this._estimateLines(task),
      complexity: this._assessComplexity(task),
      type: this._determineType(task),
      requirements: this._extractRequirements(task)
    };
  }

  /**
   * Select the optimal tool for a given task
   * @param {Object} task - The task to process
   * @returns {Object} Selection results with tool recommendation and reasoning
   */
  selectTool(task) {
    const analysis = this.analyzeTask(task);
    const scores = this._calculateToolScores(analysis);
    
    // Get tool with highest score
    const bestTool = Object.entries(scores)
      .reduce((best, [tool, score]) => 
        score > best.score ? {tool, score} : best, 
        {tool: null, score: -1}
      );

    return {
      selectedTool: bestTool.tool,
      score: bestTool.score,
      analysis: analysis,
      reason: this._generateReasoning(bestTool.tool, analysis)
    };
  }

  // Private methods for detailed analysis
  _estimateLines(task) {
    // Estimate lines based on requirements and complexity
    const baseLines = {
      'component': 50,
      'function': 20,
      'system': 100
    }[task.type] || 30;

    const complexityMultiplier = {
      'low': 0.7,
      'medium': 1.0,
      'high': 1.5
    }[task.complexity] || 1.0;

    return Math.round(baseLines * complexityMultiplier);
  }

  _assessComplexity(task) {
    let score = 0;
    
    // Add complexity points based on features
    if (task.features?.includes('stateManagement')) score += 2;
    if (task.features?.includes('asyncOperations')) score += 2;
    if (task.features?.includes('accessibility')) score += 1;
    if (task.features?.includes('animations')) score += 1;
    if (task.features?.includes('validation')) score += 1;

    // Determine complexity level
    if (score <= 2) return 'low';
    if (score <= 5) return 'medium';
    return 'high';
  }

  _determineType(task) {
    const typeIndicators = {
      ui: ['component', 'interface', 'view', 'page', 'form'],
      logic: ['function', 'utility', 'algorithm', 'processor'],
      design: ['system', 'theme', 'style', 'pattern']
    };

    for (const [type, indicators] of Object.entries(typeIndicators)) {
      if (indicators.some(indicator => 
        task.description.toLowerCase().includes(indicator))) {
        return type;
      }
    }

    return 'unknown';
  }

  _calculateToolScores(analysis) {
    const scores = {};
    
    for (const [tool, profile] of Object.entries(this.toolProfiles)) {
      let score = 0;

      // Check size constraints
      if (analysis.estimatedLines >= profile.minLines && 
          analysis.estimatedLines <= profile.maxLines) {
        score += 3;
      }

      // Check complexity match
      if (analysis.complexity === profile.optimalComplexity) {
        score += 2;
      }

      // Check type alignment
      if (profile.strengths.includes(analysis.type)) {
        score += 2;
      }

      // Check special requirements
      for (const req of analysis.requirements) {
        if (profile.specialties[req]) {
          score += profile.specialties[req];
        }
      }

      scores[tool] = score;
    }

    return scores;
  }

  _extractRequirements(task) {
    const requirements = [];
    const indicators = {
      typescript: ['typescript', 'type-safe', 'typed'],
      accessibility: ['a11y', 'accessible', 'wcag'],
      stateManagement: ['state', 'store', 'redux'],
      customHooks: ['hook', 'custom hook', 'use'],
      errorHandling: ['error', 'exception', 'handling'],
      responsiveDesign: ['responsive', 'mobile', 'adaptive'],
      designSystems: ['design system', 'theme', 'style guide']
    };

    for (const [req, terms] of Object.entries(indicators)) {
      if (terms.some(term => task.description.toLowerCase().includes(term))) {
        requirements.push(req);
      }
    }

    return requirements;
  }

  _generateReasoning(tool, analysis) {
    const reasonings = {
      haiku: [
        'Optimal for logic-heavy tasks',
        'Best for custom hooks and complex state management',
        'Strong error handling capabilities',
        'Good for medium-sized utilities'
      ],
      boltNew: [
        'Ideal for UI components',
        'Strong TypeScript support',
        'Excellent for forms and interactive elements',
        'Good component architecture'
      ],
      v0Dev: [
        'Perfect for design systems',
        'Best for theme management',
        'Excellent for pattern libraries',
        'Good for large-scale visual consistency'
      ],
      claudeDirect: [
        'Best for quick prototypes',
        'Ideal for simple functions',
        'Good for basic components',
        'Perfect for rapid iterations'
      ]
    };

    return reasonings[tool] || ['Tool selected based on analysis'];
  }
}

module.exports = ToolSelector;
