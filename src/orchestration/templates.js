/**
 * AI-AutoCoding-DAO Template Manager
 * Enhanced with specialized bolt.diy and claudeSonnet templates
 */
const logger = require('../utils/logger');

class TemplateManager {
  constructor() {
    // Templates for different tools
    this.templates = {
      boltDiy: {
        ui: {
          template: `# UI Component Implementation

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
        },
        utility: {
          template: `# Utility Module Implementation

## Module Purpose
{description}

## API Design
{apiDesign}

## Features
{features}

## Implementation Requirements
- Error Handling: {errorHandling}
- Performance: {performance}
- Documentation: {documentation}

## Usage Examples
{usageExamples}`,
          defaults: {
            apiDesign: '- Define public API\n- Specify types and interfaces',
            features: '- List key features\n- Note requirements',
            errorHandling: 'Comprehensive error handling',
            performance: 'Optimized for common cases',
            documentation: 'JSDoc documentation required',
            usageExamples: '- Add usage examples\n- Show common patterns'
          }
        }
      },
      claudeSonnet: {
        ui: {
          template: `# UI Component Implementation Task

## Overview
Create a UI component that implements the following requirements:
{description}

## Component Interface
{propsInterface}

## Requirements
1. State Management
   {stateManagement}

2. Event Handling
   {eventHandling}

3. Styling
   {styling}

4. Accessibility
   {accessibility}

## Technical Details
- Framework: {framework}
- Dependencies: {dependencies}
- Browser Support: {browserSupport}

## Additional Notes
{implementationNotes}

Please provide a complete, production-ready implementation.`,
          defaults: {
            propsInterface: 'Define a TypeScript interface for component props with proper validation',
            stateManagement: 'Implement efficient local state management',
            eventHandling: 'Handle all relevant user interactions',
            styling: 'Use CSS Modules with responsive design',
            accessibility: 'Follow WCAG 2.1 guidelines',
            framework: 'React with TypeScript',
            dependencies: 'Minimal external dependencies',
            browserSupport: 'Modern browsers (last 2 versions)',
            implementationNotes: 'Focus on maintainability and performance'
          }
        },
        function: {
          template: `# Function Implementation Task

## Purpose
{description}

## Function Contract
Input Parameters:
{inputContract}

Return Value:
{outputContract}

## Implementation Requirements
1. Error Handling
   {errorHandling}

2. Performance
   {performance}

3. Testing
   {testing}

## Context
{technicalContext}

Please provide a complete, well-tested implementation.`,
          defaults: {
            inputContract: 'Define parameters with TypeScript types and validation',
            outputContract: 'Specify return type and error handling',
            errorHandling: 'Implement comprehensive error handling',
            performance: 'Optimize for typical use cases',
            testing: 'Include unit tests with edge cases',
            technicalContext: 'Consider integration with existing system'
          }
        },
        utility: {
          template: `# Utility Module Implementation Task

## Module Overview
{description}

## API Specification
{apiDesign}

## Required Features
{features}

## Implementation Requirements
1. Error Handling
   {errorHandling}

2. Performance Considerations
   {performance}

3. Documentation
   {documentation}

## Usage Guide
{usageExamples}

Please provide a complete, well-documented implementation.`,
          defaults: {
            apiDesign: 'Define a clean, intuitive API with TypeScript',
            features: 'List core functionality requirements',
            errorHandling: 'Handle all error cases gracefully',
            performance: 'Optimize for common operations',
            documentation: 'Include comprehensive JSDoc comments',
            usageExamples: 'Provide clear usage examples'
          }
        }
      }
    };
  }

  /**
   * Get available template types for a specific tool
   * @param {string} tool - The tool name (e.g., 'boltDiy')
   * @returns {string[]} Available template types
   */
  getTemplateTypes(tool = 'boltDiy') {
    if (!this.templates[tool]) {
      logger.warn(`Tool not found: ${tool}`);
      return [];
    }
    return Object.keys(this.templates[tool]);
  }

  /**
   * Get a template based on tool, type, and task details
   * @param {string} tool - The tool name (e.g., 'boltDiy')
   * @param {string} type - The template type
   * @param {Object} task - The task details
   * @returns {string|null} Filled template or null if not found
   */
  getTemplate(tool = 'boltDiy', type, task) {
    if (!this.templates[tool]) {
      logger.warn(`Tool not found: ${tool}`);
      return null;
    }

    const template = this.templates[tool][type];
    if (!template) {
      logger.warn(`Template type not found: ${type} for tool: ${tool}`);
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
   * Get the most appropriate template type for a task and tool
   * @param {string} tool - The tool name (e.g., 'boltDiy')
   * @param {Object} task - The task details
   * @returns {string|null} Best template type or null if tool not found
   */
  getBestTemplateType(tool = 'boltDiy', task) {
    if (!this.templates[tool]) {
      logger.warn(`Tool not found: ${tool}`);
      return null;
    }

    const type = task.type?.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    
    // Component template for UI tasks
    if (type?.includes('ui') || 
        type?.includes('component') || 
        description.includes('component') ||
        description.includes('interface')) {
      return 'ui';
    }
    
    // Function template for logic tasks
    if (type?.includes('function') || 
        type?.includes('utility') || 
        description.includes('function') ||
        description.includes('algorithm')) {
      return 'function';
    }
    
    // Utility template for module tasks
    if (type?.includes('utility') ||
        type?.includes('module') ||
        description.includes('utility') ||
        description.includes('module')) {
      return 'utility';
    }
    
    // Default to function template
    return 'function';
  }
}

module.exports = TemplateManager;