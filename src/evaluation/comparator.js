/**
 * AI-AutoCoding-DAO Implementation Comparator
 * Compares implementations from different AI tools
 */
class ImplementationComparator {
  constructor(qualityAnalyzer) {
    this.qualityAnalyzer = qualityAnalyzer;
  }
  
  /**
   * Compare multiple implementations of the same task
   * @param {Object[]} implementations - Array of implementations from different tools
   * @param {Object} task - Original task
   * @returns {Object} Comparison results
   */
  compareImplementations(implementations, task) {
    try {
      if (!implementations || implementations.length === 0) {
        throw new Error('No implementations provided for comparison');
      }
      
      // Analyze each implementation
      const analyses = implementations.map(implementation => {
        const tool = implementation.metadata?.tool || 'unknown';
        return {
          tool,
          analysis: this.qualityAnalyzer.analyzeQuality(implementation, task)
        };
      });
      
      // Rank implementations by overall score
      const ranked = [...analyses].sort((a, b) => 
        b.analysis.overallScore - a.analysis.overallScore
      );
      
      // Compare metrics across implementations
      const metricComparisons = this._compareMetrics(analyses);
      
      // Generate overall findings
      const findings = this._generateFindings(ranked, metricComparisons, task);
      
      return {
        ranked,
        metricComparisons,
        findings,
        task,
        bestImplementation: ranked[0],
        bestTool: ranked[0].tool,
        implementationCount: implementations.length
      };
    } catch (error) {
      console.error(`Implementation comparison failed: ${error.message}`);
      return {
        ranked: [],
        metricComparisons: {},
        findings: {
          overall: [`Comparison failed: ${error.message}`],
          strengths: [],
          weaknesses: [],
          recommendations: []
        },
        task,
        error: error.message
      };
    }
  }
  
  /**
   * Compare metrics across implementations
   * @private
   * @param {Object[]} analyses - Analysis results for each implementation
   * @returns {Object} Metric comparisons
   */
  _compareMetrics(analyses) {
    const metrics = [
      'functionality', 
      'codeQuality', 
      'architecture', 
      'accessibility', 
      'performance', 
      'visualImplementation', 
      'errorHandling', 
      'tokenEfficiency'
    ];
    
    const comparisons = {};
    
    // For each metric, compare across implementations
    metrics.forEach(metric => {
      const metricScores = analyses.map(analysis => ({
        tool: analysis.tool,
        score: analysis.analysis.detailedScores[metric]?.rawScore || 0
      }));
      
      // Sort by score (highest first)
      const sortedScores = [...metricScores].sort((a, b) => b.score - a.score);
      
      // Find top performer in this metric
      const topPerformer = sortedScores[0];
      
      // Calculate average score for this metric
      const averageScore = metricScores.reduce((sum, item) => sum + item.score, 0) / metricScores.length;
      
      // Calculate score spread (difference between highest and lowest)
      const scoreSpread = sortedScores[0].score - sortedScores[sortedScores.length - 1].score;
      
      comparisons[metric] = {
        scores: metricScores,
        ranked: sortedScores,
        topPerformer,
        averageScore,
        scoreSpread
      };
    });
    
    return comparisons;
  }
  
  /**
   * Generate overall findings from comparison results
   * @private
   * @param {Object[]} ranked - Ranked implementations
   * @param {Object} metricComparisons - Metric comparison results
   * @param {Object} task - Original task
   * @returns {Object} Overall findings
   */
  _generateFindings(ranked, metricComparisons, task) {
    const findings = {
      overall: [],
      strengths: [],
      weaknesses: [],
      patterns: [],
      recommendations: []
    };
    
    // Overall findings
    findings.overall.push(`Analyzed ${ranked.length} implementations for task: ${task.id || 'Unknown'}`);
    findings.overall.push(`Best performing tool: ${ranked[0].tool} with score ${ranked[0].analysis.overallScore}/10`);
    
    if (ranked.length > 1) {
      const scoreDiff = ranked[0].analysis.overallScore - ranked[ranked.length - 1].analysis.overallScore;
      findings.overall.push(`Score range: ${scoreDiff.toFixed(1)} points between highest and lowest implementations`);
    }
    
    // Identify strengths across implementations
    const commonStrengths = this._findCommonStrengths(ranked);
    findings.strengths = commonStrengths.map(strength => 
      `Common strength: ${strength.metric} - ${strength.count}/${ranked.length} implementations`
    );
    
    // Identify weaknesses across implementations
    const commonWeaknesses = this._findCommonWeaknesses(ranked);
    findings.weaknesses = commonWeaknesses.map(weakness => 
      `Common weakness: ${weakness.metric} - ${weakness.count}/${ranked.length} implementations`
    );
    
    // Identify patterns in top implementations
    findings.patterns = this._identifyPatterns(ranked, metricComparisons);
    
    // Generate recommendations
    findings.recommendations = this._generateRecommendations(ranked, metricComparisons, task);
    
    return findings;
  }
  
  /**
   * Find common strengths across implementations
   * @private
   * @param {Object[]} ranked - Ranked implementations
   * @returns {Object[]} Common strengths
   */
  _findCommonStrengths(ranked) {
    const strengths = [];
    const metrics = [
      'functionality', 
      'codeQuality', 
      'architecture', 
      'accessibility', 
      'performance', 
      'visualImplementation', 
      'errorHandling', 
      'tokenEfficiency'
    ];
    
    metrics.forEach(metric => {
      // Count how many implementations have this as a strength (score >= 8)
      const count = ranked.filter(item => {
        const score = item.analysis.detailedScores[metric]?.rawScore || 0;
        return score >= 8;
      }).length;
      
      // If more than half have this as a strength, consider it common
      if (count > ranked.length / 2) {
        strengths.push({
          metric,
          count
        });
      }
    });
    
    return strengths;
  }
  
  /**
   * Find common weaknesses across implementations
   * @private
   * @param {Object[]} ranked - Ranked implementations
   * @returns {Object[]} Common weaknesses
   */
  _findCommonWeaknesses(ranked) {
    const weaknesses = [];
    const metrics = [
      'functionality', 
      'codeQuality', 
      'architecture', 
      'accessibility', 
      'performance', 
      'visualImplementation', 
      'errorHandling', 
      'tokenEfficiency'
    ];
    
    metrics.forEach(metric => {
      // Count how many implementations have this as a weakness (score < 6)
      const count = ranked.filter(item => {
        const score = item.analysis.detailedScores[metric]?.rawScore || 0;
        return score < 6;
      }).length;
      
      // If more than half have this as a weakness, consider it common
      if (count > ranked.length / 2) {
        weaknesses.push({
          metric,
          count
        });
      }
    });
    
    return weaknesses;
  }
  
  /**
   * Identify patterns in top implementations
   * @private
   * @param {Object[]} ranked - Ranked implementations
   * @param {Object} metricComparisons - Metric comparison results
   * @returns {string[]} Identified patterns
   */
  _identifyPatterns(ranked, metricComparisons) {
    const patterns = [];
    const topImplementations = ranked.slice(0, Math.ceil(ranked.length / 3));
    
    if (topImplementations.length === 0) {
      return ['Insufficient implementations to identify patterns'];
    }
    
    // Check for tool patterns
    const toolCounts = {};
    topImplementations.forEach(impl => {
      toolCounts[impl.tool] = (toolCounts[impl.tool] || 0) + 1;
    });
    
    const dominantTools = Object.entries(toolCounts)
      .filter(([, count]) => count > 1)
      .map(([tool]) => tool);
    
    if (dominantTools.length > 0) {
      patterns.push(`Top implementations tend to use: ${dominantTools.join(', ')}`);
    }
    
    // Check for metric patterns
    const strongMetrics = [];
    Object.entries(metricComparisons).forEach(([metric, comparison]) => {
      const topTools = new Set(topImplementations.map(impl => impl.tool));
      const metricTopPerformers = comparison.ranked
        .filter(item => item.score >= 8)
        .map(item => item.tool);
      
      const overlap = metricTopPerformers.filter(tool => topTools.has(tool));
      
      if (overlap.length > 0 && overlap.length >= Math.ceil(topImplementations.length / 2)) {
        strongMetrics.push(metric);
      }
    });
    
    if (strongMetrics.length > 0) {
      patterns.push(`Top implementations excel in: ${strongMetrics.join(', ')}`);
    }
    
    return patterns;
  }
  
  /**
   * Generate recommendations based on comparison results
   * @private
   * @param {Object[]} ranked - Ranked implementations
   * @param {Object} metricComparisons - Metric comparison results
   * @param {Object} task - Original task
   * @returns {string[]} Recommendations
   */
  _generateRecommendations(ranked, metricComparisons, task) {
    const recommendations = [];
    
    // Recommend best tool for this type of task
    if (ranked.length > 0) {
      const bestTool = ranked[0].tool;
      recommendations.push(`For tasks similar to "${task.id || 'this type'}", use ${bestTool} as the primary tool`);
    }
    
    // Recommend tools for specific aspects
    Object.entries(metricComparisons).forEach(([metric, comparison]) => {
      if (comparison.ranked.length > 0 && comparison.ranked[0].score >= 8) {
        const bestToolForMetric = comparison.ranked[0].tool;
        
        // Only add recommendation if this tool is particularly good at this metric
        if (comparison.scoreSpread >= 2) {
          recommendations.push(`For ${metric}, consider ${bestToolForMetric} (${comparison.ranked[0].score}/10)`);
        }
      }
    });
    
    // Recommend improvements to task descriptions
    const lowFunctionalityCount = ranked.filter(item => {
      const score = item.analysis.detailedScores.functionality?.rawScore || 0;
      return score < 7;
    }).length;
    
    if (lowFunctionalityCount > ranked.length / 2) {
      recommendations.push('Consider improving task descriptions with more specific requirements');
    }
    
    // Recommend template improvements
    const lowScoreCounts = {};
    const metrics = [
      'functionality', 
      'codeQuality', 
      'architecture', 
      'accessibility', 
      'performance', 
      'visualImplementation', 
      'errorHandling', 
      'tokenEfficiency'
    ];
    
    metrics.forEach(metric => {
      lowScoreCounts[metric] = ranked.filter(item => {
        const score = item.analysis.detailedScores[metric]?.rawScore || 0;
        return score < 6;
      }).length;
    });
    
    const problematicMetrics = Object.entries(lowScoreCounts)
      .filter(([, count]) => count > ranked.length / 2)
      .map(([metric]) => metric);
    
    if (problematicMetrics.length > 0) {
      recommendations.push(`Update templates to emphasize: ${problematicMetrics.join(', ')}`);
    }
    
    return recommendations;
  }
}

module.exports = ImplementationComparator;
