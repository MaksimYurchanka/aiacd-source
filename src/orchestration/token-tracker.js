/**
 * AI-AutoCoding-DAO Token Tracker
 * Tracks token usage and calculates efficiency metrics across different tools
 */
class TokenTracker {
  constructor() {
    this.tasks = new Map();
    this.directCosts = new Map();
    this.delegatedCosts = new Map();
    this.toolPerformance = new Map();
    this.historicalData = [];
    this.startTime = Date.now();
  }

  /**
   * Track a new task
   * @param {string} taskId - Unique identifier for the task
   * @param {string} description - Task description
   * @param {string} complexity - Task complexity (low, medium, high)
   * @returns {string} Task ID
   */
  startTask(taskId, description, complexity = 'medium') {
    this.tasks.set(taskId, {
      description,
      complexity,
      startTime: Date.now(),
      direct: 0,
      delegated: {
        analysis: 0,
        delegation: 0,
        review: 0,
        total: 0
      },
      tools: {},
      completed: false,
      metrics: {
        timeToComplete: 0,
        qualityScore: 0,
        efficiencyRatio: 0
      }
    });
    
    return taskId;
  }

  /**
   * Record direct coding cost
   * @param {string} taskId - Task identifier
   * @param {number} tokens - Token count
   * @param {number} timeSpent - Time spent in minutes
   */
  recordDirectCost(taskId, tokens, timeSpent) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.direct = tokens;
      task.metrics.directTimeSpent = timeSpent;
      this.directCosts.set(taskId, tokens);
    }
  }

  /**
   * Record delegated task costs with specific tool
   * @param {string} taskId - Task identifier
   * @param {string} toolName - AI tool name
   * @param {Object} costs - Cost breakdown
   * @param {number} costs.analysis - Tokens for analysis
   * @param {number} costs.delegation - Tokens for delegation
   * @param {number} costs.review - Tokens for review
   * @param {number} costs.timeSpent - Total time spent
   */
  recordDelegatedCost(taskId, toolName, {analysis, delegation, review, timeSpent}) {
    const task = this.tasks.get(taskId);
    if (task) {
      const total = analysis + delegation + review;
      
      // Record per-tool metrics
      task.tools[toolName] = {
        analysis,
        delegation,
        review,
        total,
        timeSpent
      };
      
      // Update overall delegation costs
      // Store the best performing delegation
      if (!task.delegated.total || total < task.delegated.total) {
        task.delegated = {
          analysis,
          delegation,
          review,
          total,
          toolName,
          timeSpent
        };
      }
      
      this.delegatedCosts.set(taskId, task.delegated.total);
      
      // Update tool performance metrics
      this._updateToolPerformance(toolName, task.complexity, total, timeSpent);
    }
  }
  
  /**
   * Mark a task as complete with quality metrics
   * @param {string} taskId - Task identifier
   * @param {number} qualityScore - Quality score (0-10)
   */
  completeTask(taskId, qualityScore) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.completed = true;
      task.metrics.timeToComplete = Date.now() - task.startTime;
      task.metrics.qualityScore = qualityScore;
      
      if (task.direct > 0 && task.delegated.total > 0) {
        task.metrics.efficiencyRatio = task.direct / task.delegated.total;
      }
      
      // Add to historical data
      this.historicalData.push({
        taskId,
        description: task.description,
        complexity: task.complexity,
        directTokens: task.direct,
        delegatedTokens: task.delegated.total,
        bestTool: task.delegated.toolName,
        efficiencyRatio: task.metrics.efficiencyRatio,
        qualityScore,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Compare efficiency between direct and delegated approaches
   * @param {string} taskId - Task identifier
   * @returns {Object|null} Efficiency comparison
   */
  compareEfficiency(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const savings = task.direct - task.delegated.total;
    const efficiency = task.direct > 0 ? 
      ((task.direct - task.delegated.total) / task.direct) * 100 : 0;
    
    // Calculate normalized efficiency based on complexity
    const complexityWeights = {
      low: 0.8,
      medium: 1.0,
      high: 1.2
    };
    
    const weight = complexityWeights[task.complexity] || 1.0;
    const normalizedEfficiency = efficiency * weight;

    return {
      taskId,
      description: task.description,
      complexity: task.complexity,
      directCost: task.direct,
      delegatedCost: task.delegated,
      tokenSavings: savings,
      efficiencyGain: efficiency.toFixed(2) + '%',
      normalizedEfficiency: normalizedEfficiency.toFixed(2) + '%',
      bestTool: task.delegated.toolName,
      qualityScore: task.metrics.qualityScore,
      timeToComplete: task.metrics.timeToComplete
    };
  }

  /**
   * Get overall system statistics
   * @returns {Object} System statistics
   */
  getStats() {
    let totalDirect = 0;
    let totalDelegated = 0;
    let totalTasks = 0;
    let totalCompletedTasks = 0;
    
    const toolBreakdown = {};
    const complexityBreakdown = {
      low: { direct: 0, delegated: 0, count: 0 },
      medium: { direct: 0, delegated: 0, count: 0 },
      high: { direct: 0, delegated: 0, count: 0 }
    };
    
    const stats = {
      totalTasks: this.tasks.size,
      completedTasks: 0,
      tokenSavings: 0,
      averageEfficiency: 0,
      taskBreakdown: [],
      toolPerformance: [],
      complexityAnalysis: {},
      trendAnalysis: this._analyzeTrends(),
      targetProgress: 0
    };

    this.tasks.forEach((task, taskId) => {
      totalTasks++;
      
      if (task.completed) {
        totalCompletedTasks++;
        totalDirect += task.direct;
        totalDelegated += task.delegated.total;
        
        // Add to complexity breakdown
        if (complexityBreakdown[task.complexity]) {
          complexityBreakdown[task.complexity].direct += task.direct;
          complexityBreakdown[task.complexity].delegated += task.delegated.total;
          complexityBreakdown[task.complexity].count++;
        }
        
        // Process tool usage
        const toolName = task.delegated.toolName;
        if (toolName) {
          if (!toolBreakdown[toolName]) {
            toolBreakdown[toolName] = {
              taskCount: 0,
              totalTokens: 0,
              averageTokens: 0
            };
          }
          
          toolBreakdown[toolName].taskCount++;
          toolBreakdown[toolName].totalTokens += task.delegated.total;
          toolBreakdown[toolName].averageTokens = 
            toolBreakdown[toolName].totalTokens / toolBreakdown[toolName].taskCount;
        }
        
        stats.taskBreakdown.push(this.compareEfficiency(taskId));
      }
    });

    stats.completedTasks = totalCompletedTasks;
    stats.tokenSavings = totalDirect - totalDelegated;
    
    if (totalDirect > 0) {
      stats.averageEfficiency = ((totalDirect - totalDelegated) / totalDirect * 100).toFixed(2) + '%';
      // Calculate progress toward 5-7x target (starting from 1x baseline)
      const currentMultiplier = totalDirect / totalDelegated;
      const targetMultiplier = 6; // Middle of 5-7x range
      stats.targetProgress = Math.min(100, (currentMultiplier - 1) / (targetMultiplier - 1) * 100).toFixed(2) + '%';
    }
    
    // Process complexity breakdown
    Object.keys(complexityBreakdown).forEach(complexity => {
      const data = complexityBreakdown[complexity];
      if (data.count > 0) {
        data.averageDirect = data.direct / data.count;
        data.averageDelegated = data.delegated / data.count;
        data.efficiencyRatio = data.direct > 0 ? data.direct / data.delegated : 0;
        data.efficiencyGain = data.direct > 0 ? 
          ((data.direct - data.delegated) / data.direct * 100).toFixed(2) + '%' : '0%';
      }
    });
    
    stats.complexityAnalysis = complexityBreakdown;
    
    // Process tool performance
    this.toolPerformance.forEach((performance, tool) => {
      stats.toolPerformance.push({
        tool,
        ...performance
      });
    });

    return stats;
  }
  
  /**
   * Get visualization-ready data
   * @returns {Object} Data ready for visualization
   */
  getVisualizationData() {
    return {
      efficiencyTrend: this._prepareEfficiencyTrendData(),
      toolComparison: this._prepareToolComparisonData(),
      complexityAnalysis: this._prepareComplexityAnalysisData(),
      targetProgress: this._prepareTargetProgressData()
    };
  }
  
  // Private methods
  
  /**
   * Update tool performance metrics
   * @private
   */
  _updateToolPerformance(toolName, complexity, tokens, timeSpent) {
    if (!this.toolPerformance.has(toolName)) {
      this.toolPerformance.set(toolName, {
        taskCount: 0,
        totalTokens: 0,
        averageTokens: 0,
        totalTime: 0,
        averageTime: 0,
        complexityBreakdown: {
          low: { count: 0, tokens: 0 },
          medium: { count: 0, tokens: 0 },
          high: { count: 0, tokens: 0 }
        }
      });
    }
    
    const performance = this.toolPerformance.get(toolName);
    performance.taskCount++;
    performance.totalTokens += tokens;
    performance.averageTokens = performance.totalTokens / performance.taskCount;
    
    if (timeSpent) {
      performance.totalTime += timeSpent;
      performance.averageTime = performance.totalTime / performance.taskCount;
    }
    
    // Update complexity metrics
    if (performance.complexityBreakdown[complexity]) {
      performance.complexityBreakdown[complexity].count++;
      performance.complexityBreakdown[complexity].tokens += tokens;
    }
  }
  
  /**
   * Analyze historical trends
   * @private
   */
  _analyzeTrends() {
    if (this.historicalData.length < 2) {
      return { trend: 'insufficient data', improvement: 0 };
    }
    
    // Sort by timestamp
    const sortedData = [...this.historicalData].sort((a, b) => a.timestamp - b.timestamp);
    
    // Compare first third to last third to see improvement
    const splitPoint = Math.floor(sortedData.length / 3);
    
    if (splitPoint === 0) {
      return { trend: 'insufficient data', improvement: 0 };
    }
    
    const firstGroup = sortedData.slice(0, splitPoint);
    const lastGroup = sortedData.slice(-splitPoint);
    
    // Calculate average efficiency for both groups
    const firstAvg = firstGroup.reduce((sum, item) => sum + item.efficiencyRatio, 0) / firstGroup.length;
    const lastAvg = lastGroup.reduce((sum, item) => sum + item.efficiencyRatio, 0) / lastGroup.length;
    
    const improvementPercent = firstAvg > 0 ? 
      ((lastAvg - firstAvg) / firstAvg * 100).toFixed(2) : 0;
    
    return {
      trend: lastAvg > firstAvg ? 'improving' : 'declining',
      improvement: improvementPercent + '%',
      firstGroupAvg: firstAvg.toFixed(2),
      lastGroupAvg: lastAvg.toFixed(2)
    };
  }
  
  /**
   * Prepare data for efficiency trend visualization
   * @private
   */
  _prepareEfficiencyTrendData() {
    // Group tasks by week
    const weeklyData = {};
    
    this.historicalData.forEach(item => {
      // Get week number
      const date = new Date(item.timestamp);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          tasks: 0,
          totalEfficiency: 0,
          avgEfficiency: 0
        };
      }
      
      weeklyData[weekKey].tasks++;
      weeklyData[weekKey].totalEfficiency += item.efficiencyRatio;
      weeklyData[weekKey].avgEfficiency = 
        weeklyData[weekKey].totalEfficiency / weeklyData[weekKey].tasks;
    });
    
    // Convert to array and sort by week
    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  }
  
  /**
   * Prepare data for tool comparison visualization
   * @private
   */
  _prepareToolComparisonData() {
    const toolData = [];
    
    this.toolPerformance.forEach((performance, tool) => {
      toolData.push({
        name: tool,
        taskCount: performance.taskCount,
        avgTokens: performance.averageTokens,
        avgTime: performance.averageTime
      });
    });
    
    return toolData;
  }
  
  /**
   * Prepare data for complexity analysis visualization
   * @private
   */
  _prepareComplexityAnalysisData() {
    const complexityData = [];
    const stats = this.getStats();
    
    Object.entries(stats.complexityAnalysis).forEach(([complexity, data]) => {
      if (data.count > 0) {
        complexityData.push({
          complexity,
          taskCount: data.count,
          avgDirect: data.averageDirect,
          avgDelegated: data.averageDelegated,
          efficiencyGain: parseFloat(data.efficiencyGain)
        });
      }
    });
    
    return complexityData;
  }
  
  /**
   * Prepare data for target progress visualization
   * @private
   */
  _prepareTargetProgressData() {
    const stats = this.getStats();
    
    return {
      current: parseFloat(stats.targetProgress),
      target: 100,
      currentMultiplier: stats.averageEfficiency ? 
        (100 / (100 - parseFloat(stats.averageEfficiency))) : 1,
      targetMultiplier: 6 // Middle of 5-7x range
    };
  }
}

module.exports = TokenTracker;
