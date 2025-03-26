/**
 * AI-AutoCoding-DAO Template Builder
 * Utilities for building and filling templates
 */
const { isString, isObject } = require('./validation');
const logger = require('./logger');

/**
 * Fill template with task data and defaults
 * @param {string} template - Template string with placeholders
 * @param {Object} data - Data to fill placeholders
 * @param {Object} defaults - Default values for missing data
 * @returns {string} Filled template
 */
function fillTemplate(template, data, defaults = {}) {
  if (!isString(template)) {
    logger.error('Invalid template: not a string');
    return '';
  }
  
  if (!isObject(data)) {
    logger.error('Invalid data: not an object');
    return template;
  }
  
  if (!isObject(defaults)) {
    logger.error('Invalid defaults: not an object');
    defaults = {};
  }
  
  try {
    // Find all placeholders in the template
    const placeholderRegex = /\{([^}]+)\}/g;
    const placeholders = [];
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
      placeholders.push(match[1]);
    }
    
    // Replace placeholders with data or defaults
    let filledTemplate = template;
    
    for (const placeholder of placeholders) {
      const value = data[placeholder] !== undefined ? data[placeholder] : defaults[placeholder];
      
      if (value !== undefined) {
        // Replace all occurrences of the placeholder
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        filledTemplate = filledTemplate.replace(regex, value);
      }
    }
    
    return filledTemplate;
  } catch (error) {
    logger.error('Error filling template', error);
    return template;
  }
}

/**
 * Build a task template based on tool and type
 * @param {Object} templateManager - Template manager instance
 * @param {string} tool - Tool name
 * @param {string} type - Template type
 * @param {Object} task - Task data
 * @returns {string} Built template
 */
function buildTaskTemplate(templateManager, tool, type, task) {
  try {
    // Get template from manager
    const templateObj = templateManager.getTemplate(tool, type);
    
    if (!templateObj) {
      logger.error(`Template not found: ${tool}/${type}`);
      return '';
    }
    
    // Fill template with task data and defaults
    return fillTemplate(templateObj.template, task, templateObj.defaults);
  } catch (error) {
    logger.error('Error building task template', error);
    return '';
  }
}

/**
 * Identify placeholders in a template
 * @param {string} template - Template string
 * @returns {string[]} Array of placeholder names
 */
function identifyPlaceholders(template) {
  if (!isString(template)) {
    logger.error('Invalid template: not a string');
    return [];
  }
  
  try {
    const placeholderRegex = /\{([^}]+)\}/g;
    const placeholders = new Set();
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
      placeholders.add(match[1]);
    }
    
    return Array.from(placeholders);
  } catch (error) {
    logger.error('Error identifying placeholders', error);
    return [];
  }
}

/**
 * Calculate template completeness based on available data
 * @param {string} template - Template string
 * @param {Object} data - Data object
 * @param {Object} defaults - Default values
 * @returns {Object} Completeness information
 */
function calculateTemplateCompleteness(template, data, defaults = {}) {
  if (!isString(template) || !isObject(data)) {
    return {
      completeness: 0,
      missingPlaceholders: [],
      filledPlaceholders: []
    };
  }
  
  try {
    // Identify all placeholders
    const placeholders = identifyPlaceholders(template);
    
    if (placeholders.length === 0) {
      return {
        completeness: 100,
        missingPlaceholders: [],
        filledPlaceholders: []
      };
    }
    
    // Check which placeholders are filled
    const filledPlaceholders = [];
    const missingPlaceholders = [];
    
    for (const placeholder of placeholders) {
      if (data[placeholder] !== undefined || defaults[placeholder] !== undefined) {
        filledPlaceholders.push(placeholder);
      } else {
        missingPlaceholders.push(placeholder);
      }
    }
    
    // Calculate completeness percentage
    const completeness = Math.round((filledPlaceholders.length / placeholders.length) * 100);
    
    return {
      completeness,
      missingPlaceholders,
      filledPlaceholders
    };
  } catch (error) {
    logger.error('Error calculating template completeness', error);
    return {
      completeness: 0,
      missingPlaceholders: [],
      filledPlaceholders: []
    };
  }
}

/**
 * Create a template builder for a specific template
 * @param {string} template - Template string
 * @param {Object} defaults - Default values
 * @returns {Function} Template builder function
 */
function createTemplateBuilder(template, defaults = {}) {
  if (!isString(template)) {
    logger.error('Invalid template: not a string');
    return () => '';
  }
  
  return (data = {}) => fillTemplate(template, data, defaults);
}

module.exports = {
  fillTemplate,
  buildTaskTemplate,
  identifyPlaceholders,
  calculateTemplateCompleteness,
  createTemplateBuilder
};
