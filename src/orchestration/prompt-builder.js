/**
 * AI-AutoCoding-DAO Prompt Builder
 * Constructs optimized prompts for bolt.diy integration
 */
const logger = require('../utils/logger');
const { isString, isObject } = require('../utils/validation');

class PromptBuilder {
  constructor() {
    // Token optimization patterns
    this.patterns = {
      ui: {
        prefix: 'Create a reusable UI component with the following specifications:',
        sections: ['props', 'styling', 'behavior', 'accessibility'],
        format: 'react-typescript'
      },
      function: {
        prefix: 'Implement a function that meets these requirements:',
        sections: ['input', 'output', 'constraints', 'edge-cases'],
        format: 'typescript'
      },
      utility: {
        prefix: 'Create a utility module with the following functionality:',
        sections: ['features', 'api', 'usage', 'performance'],
        format: 'typescript'
      }
    };
  }

  /**
   * Build an optimized prompt for bolt.diy
   * @param {Object} task - Task details
   * @param {Object} template - Template object
   * @returns {string} Optimized prompt
   */
  buildPrompt(task, template) {
    try {
      if (!isObject(task) || !isObject(template)) {
        throw new Error('Invalid task or template object');
      }

      const pattern = this.patterns[task.type] || this.patterns.function;
      const context = this._buildContext(task);
      const requirements = this._formatRequirements(task, pattern);
      const guidelines = this._buildGuidelines(task, pattern);

      return `${pattern.prefix}

## Context
${context}

## Requirements
${requirements}

## Implementation Guidelines
${guidelines}

## Expected Format
\`\`\`${pattern.format}
// Implementation here
\`\`\`

## Quality Criteria
- Clean, maintainable code
- Proper error handling
- Type safety
- Performance optimization
- Documentation
`;
    } catch (error) {
      logger.error('Failed to build prompt:', error);
      throw error;
    }
  }

  /**
   * Build context section
   * @private
   * @param {Object} task - Task details
   * @returns {string} Formatted context
   */
  _buildContext(task) {
    const context = [];

    context.push(`Type: ${task.type}`);
    context.push(`Complexity: ${task.complexity}`);
    
    if (task.features?.length > 0) {
      context.push('Features:');
      task.features.forEach(feature => {
        context.push(`- ${feature}`);
      });
    }

    return context.join('\n');
  }

  /**
   * Format requirements based on pattern
   * @private
   * @param {Object} task - Task details
   * @param {Object} pattern - Task pattern
   * @returns {string} Formatted requirements
   */
  _formatRequirements(task, pattern) {
    const requirements = [];

    requirements.push(task.description);
    
    pattern.sections.forEach(section => {
      if (task[section]) {
        requirements.push(`\n${section.charAt(0).toUpperCase() + section.slice(1)}:`);
        if (Array.isArray(task[section])) {
          task[section].forEach(item => {
            requirements.push(`- ${item}`);
          });
        } else if (isObject(task[section])) {
          Object.entries(task[section]).forEach(([key, value]) => {
            requirements.push(`- ${key}: ${value}`);
          });
        } else if (isString(task[section])) {
          requirements.push(task[section]);
        }
      }
    });

    return requirements.join('\n');
  }

  /**
   * Build implementation guidelines
   * @private
   * @param {Object} task - Task details
   * @param {Object} pattern - Task pattern
   * @returns {string} Formatted guidelines
   */
  _buildGuidelines(task, pattern) {
    const guidelines = [
      'Follow these implementation guidelines:',
      '- Use TypeScript for type safety',
      '- Implement comprehensive error handling',
      '- Add JSDoc documentation for public APIs',
      '- Optimize for performance where possible'
    ];

    if (task.type === 'ui') {
      guidelines.push(
        '- Follow React best practices',
        '- Implement proper accessibility',
        '- Use CSS-in-JS or CSS modules',
        '- Consider responsive design'
      );
    }

    if (task.complexity === 'high') {
      guidelines.push(
        '- Break down complex logic',
        '- Add detailed comments',
        '- Consider edge cases',
        '- Implement proper validation'
      );
    }

    return guidelines.join('\n');
  }

  /**
   * Process implementation output
   * @param {string} output - Raw implementation output
   * @param {Object} task - Original task
   * @returns {Object} Processed implementation
   */
  processOutput(output, task) {
    try {
      if (!isString(output)) {
        throw new Error('Invalid output format');
      }

      // Extract code blocks
      const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
      const matches = [...output.matchAll(codeBlockRegex)];

      if (matches.length === 0) {
        throw new Error('No code implementation found');
      }

      // Get the largest code block
      const implementation = matches.reduce((largest, match) => 
        match[1].length > largest.length ? match[1] : largest
      , matches[0][1]);

      // Extract explanation if present
      const explanation = output.replace(codeBlockRegex, '').trim();

      return {
        implementation,
        explanation,
        metadata: {
          taskId: task.id,
          type: task.type,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Failed to process output:', error);
      throw error;
    }
  }
}

module.exports = PromptBuilder;