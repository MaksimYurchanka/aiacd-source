/**
 * AI-AutoCoding-DAO Template Manager
 * Handles task templates for Claude Sonnet integration
 */
const logger = require('../utils/logger');

class TemplateManager {
  constructor() {
    // Templates for Claude Sonnet
    this.templates = {
      claudeSonnet: {
        basic: {
          template: `# Task Implementation Specification

## Description
{description}

## Requirements
{requirements}

## Technical Details
- Type: {type}
- Complexity: {complexity}
- Features: {features}

## Implementation Guidelines
- Follow clean code principles
- Include proper error handling
- Add comprehensive comments
- Consider edge cases
- Optimize for performance

## Expected Output
- Complete implementation
- Documentation
- Test cases
- Error handling`,
          defaults: {
            requirements: '- List key requirements\n- Include acceptance criteria',
            type: 'component',
            complexity: 'medium',
            features: '[]'
          }
        },
        component: {
          template: `# Component Implementation

## Component Overview
{description}

## Props Interface
{propsInterface}

## Component Requirements
- State Management: {stateManagement}
- Event Handling: {eventHandling}
- Styling: {styling}
- Accessibility: {accessibility}

## Technical Specifications
- Framework: {framework}
- Dependencies: {dependencies}
- Browser Support: {browserSupport}

## Implementation Notes
{implementationNotes}`,
          defaults: {
            propsInterface: '- Define component props\n- Specify types and validation',
            stateManagement: 'Local state management',
            eventHandling: 'Standard event handlers',
            styling: 'CSS Modules',
            accessibility: 'WCAG 2.1 compliance',
            framework: 'React',
            dependencies: 'Standard dependencies',
            browserSupport: 'Modern browsers',
            implementationNotes: '- Add implementation details\n- Note any special considerations'
          }
        },
        function: {
          template: `# Function Implementation

## Function Purpose
{description}

## Input/Output Contract
Input:
{inputContract}

Output:
{outputContract}

## Implementation Requirements
- Error Handling: {errorHandling}
- Performance: {performance}
- Testing: {testing}

## Technical Context
{technicalContext}`,
          defaults: {
            inputContract: '- Define input parameters\n- Specify types and validation',
            outputContract: '- Define return type\n- Specify error cases',
            errorHandling: 'Comprehensive error handling required',
            performance: 'O(n) time complexity',
            testing: 'Unit tests required',
            technicalContext: '- Add technical details\n- Note dependencies and requirements'
          }
        }
      }
    };
  }

  /**
   * Get available template types for Claude Sonnet
   * @returns {string[]} Available template types
   */
  getTemplateTypes() {
    return Object.keys(this.templates.claudeSonnet);
  }

  /**
   * Get a template based on type and task details
   * @param {string} type - The template type
   * @param {Object} task - The task details
   * @returns {string|null} Filled template or null if not found
   */
  getTemplate(type, task) {
    const template = this.templates.claudeSonnet[type];
    if (!template) {
      logger.warn(`Template type not found: ${type}`);
      return null;
    }

    let filledTemplate = template.template;
    
    // Replace description
    filledTemplate = filledTemplate.replace('{description}', task.description || '[Description]');
    
    // Replace other placeholders with task details or defaults
    for (const [key, defaultValue] of Object.entries(template.defaults)) {
      const placeholder = `{${key}}`;
      const value = task[key] || defaultValue;
      filledTemplate = filledTemplate.replace(placeholder, value);
    }
    
    return filledTemplate;
  }

  /**
   * Get the most appropriate template type for a task
   * @param {Object} task - The task details
   * @returns {string} Best template type
   */
  getBestTemplateType(task) {
    const type = task.type?.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    
    // Component template for UI tasks
    if (type?.includes('ui') || 
        type?.includes('component') || 
        description.includes('component') ||
        description.includes('interface')) {
      return 'component';
    }
    
    // Function template for logic tasks
    if (type?.includes('function') || 
        type?.includes('utility') || 
        description.includes('function') ||
        description.includes('algorithm')) {
      return 'function';
    }
    
    // Default to basic template
    return 'basic';
  }

  /**
   * Generate a token-optimized task template
   * @param {Object} task - The task details
   * @returns {string} The filled template
   */
  generateTemplate(task) {
    const templateType = this.getBestTemplateType(task);
    return this.getTemplate(templateType, task);
  }
}

module.exports = TemplateManager;