/**
 * AI-AutoCoding-DAO Metrics Collector
 * Collects and aggregates metrics from various system components
 */
const logger = require('../utils/logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      tasks: new Map(),
      tokenUsage: {
        total: 0,
        byTool: new Map(),
        byType: new Map(),
        history: []
      },
      quality: {
        average: 0,
        byType: new Map(),
        history: []
      },
      performance: {
        processedTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        averageProcessingTime: 0
      },
      efficiency: {
        current: 0,
        target: 6, // 5-7x improvement target
        history: []
      }
    };
  }

  /**
   * Record task metrics
   * @param {Object} task - Task details
   * @param {Object} result - Task result
   */
  recordTaskMetrics(task, result) {
    try {
      const timestamp = new Date().toISOString();
      const taskMetrics = {
        id: task.id,
        type: task.type,
        complexity: task.complexity,
        tokenUsage: result.tokenUsage || { total: 0 },
        quality: result.quality || { overallScore: 0 },
        timestamp
      };

      // Update task metrics
      this.metrics.tasks.set(task.id, taskMetrics);

      // Update token usage metrics
      this._updateTokenMetrics(taskMetrics);

      // Update quality metrics
      this._updateQualityMetrics(taskMetrics);

      // Update performance metrics
      this._updatePerformanceMetrics(result.success);

      // Update efficiency metrics
      this._updateEfficiencyMetrics(taskMetrics);

      logger.debug(`Recorded metrics for task: ${task.id}`);
    } catch (error) {
      logger.error('Failed to record task metrics:', error);
    }
  }

  /**
   * Get visualization data
   * @returns {Object} Data formatted for visualization
   */
  getVisualizationData() {
    return {
      efficiency: this._getEfficiencyChartData(),
      quality: this._getQualityChartData(),
      tokenUsage: this._getTokenUsageChartData(),
      performance: this._getPerformanceChartData()
    };
  }

  /**
   * Generate metrics report
   * @param {string} format - Report format ('json' or 'csv')
   * @returns {string} Formatted report
   */
  generateReport(format = 'json') {
    const report = {
      summary: this._generateSummary(),
      detailed: {
        tasks: Array.from(this.metrics.tasks.values()),
        tokenUsage: {
          ...this.metrics.tokenUsage,
          byTool: Object.fromEntries(this.metrics.tokenUsage.byTool),
          byType: Object.fromEntries(this.metrics.tokenUsage.byType)
        },
        quality: {
          ...this.metrics.quality,
          byType: Object.fromEntries(this.metrics.quality.byType)
        },
        performance: this.metrics.performance,
        efficiency: this.metrics.efficiency
      }
    };

    return format === 'csv' ? this._convertToCSV(report) : JSON.stringify(report, null, 2);
  }

  // Private methods for metric updates
  _updateTokenMetrics(taskMetrics) {
    const { tokenUsage, type } = taskMetrics;
    
    // Update total tokens
    this.metrics.tokenUsage.total += tokenUsage.total;

    // Update by type
    const typeTokens = this.metrics.tokenUsage.byType.get(type) || 0;
    this.metrics.tokenUsage.byType.set(type, typeTokens + tokenUsage.total);

    // Add to history
    this.metrics.tokenUsage.history.push({
      timestamp: taskMetrics.timestamp,
      tokens: tokenUsage.total,
      type
    });
  }

  _updateQualityMetrics(taskMetrics) {
    const { quality, type } = taskMetrics;
    
    // Update average quality
    const tasks = this.metrics.tasks.size;
    this.metrics.quality.average = (
      (this.metrics.quality.average * (tasks - 1) + quality.overallScore) / tasks
    );

    // Update by type
    const typeQuality = this.metrics.quality.byType.get(type) || { count: 0, total: 0 };
    this.metrics.quality.byType.set(type, {
      count: typeQuality.count + 1,
      total: typeQuality.total + quality.overallScore
    });

    // Add to history
    this.metrics.quality.history.push({
      timestamp: taskMetrics.timestamp,
      score: quality.overallScore,
      type
    });
  }

  _updatePerformanceMetrics(success) {
    this.metrics.performance.processedTasks++;
    if (success) {
      this.metrics.performance.successfulTasks++;
    } else {
      this.metrics.performance.failedTasks++;
    }
  }

  _updateEfficiencyMetrics(taskMetrics) {
    const { tokenUsage } = taskMetrics;
    const baselineTokens = tokenUsage.total * 6; // Estimated baseline (6x current)
    const efficiency = baselineTokens / tokenUsage.total;

    this.metrics.efficiency.current = efficiency;
    this.metrics.efficiency.history.push({
      timestamp: taskMetrics.timestamp,
      efficiency,
      tokens: tokenUsage.total
    });
  }

  // Private methods for data formatting
  _getEfficiencyChartData() {
    return {
      labels: this.metrics.efficiency.history.map(entry => entry.timestamp),
      datasets: [{
        label: 'Efficiency Ratio',
        data: this.metrics.efficiency.history.map(entry => entry.efficiency)
      }]
    };
  }

  _getQualityChartData() {
    return {
      labels: this.metrics.quality.history.map(entry => entry.timestamp),
      datasets: [{
        label: 'Quality Score',
        data: this.metrics.quality.history.map(entry => entry.score)
      }]
    };
  }

  _getTokenUsageChartData() {
    return {
      labels: this.metrics.tokenUsage.history.map(entry => entry.timestamp),
      datasets: [{
        label: 'Token Usage',
        data: this.metrics.tokenUsage.history.map(entry => entry.tokens)
      }]
    };
  }

  _getPerformanceChartData() {
    const { processedTasks, successfulTasks, failedTasks } = this.metrics.performance;
    return {
      labels: ['Successful', 'Failed'],
      datasets: [{
        data: [successfulTasks, failedTasks],
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    };
  }

  _generateSummary() {
    const { processedTasks, successfulTasks } = this.metrics.performance;
    return {
      totalTasks: processedTasks,
      successRate: (successfulTasks / processedTasks * 100).toFixed(2) + '%',
      averageQuality: this.metrics.quality.average.toFixed(2),
      currentEfficiency: this.metrics.efficiency.current.toFixed(2) + 'x',
      totalTokens: this.metrics.tokenUsage.total,
      targetProgress: (
        (this.metrics.efficiency.current / this.metrics.efficiency.target) * 100
      ).toFixed(2) + '%'
    };
  }

  _convertToCSV(report) {
    // Implementation of CSV conversion would go here
    // For brevity, returning a simple CSV format
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', report.summary.totalTasks],
      ['Success Rate', report.summary.successRate],
      ['Average Quality', report.summary.averageQuality],
      ['Current Efficiency', report.summary.currentEfficiency],
      ['Total Tokens', report.summary.totalTokens],
      ['Target Progress', report.summary.targetProgress]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}

module.exports = MetricsCollector;