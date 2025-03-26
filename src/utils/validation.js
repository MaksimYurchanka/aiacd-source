/**
 * AI-AutoCoding-DAO Validation Utilities
 * Provides common validation functions for the AI-AutoCoding-DAO system
 */

/**
 * Check if a value is defined and not null
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is defined and not null
 */
function isDefined(value) {
  return value !== undefined && value !== null;
}

/**
 * Check if a value is an object
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is an object
 */
function isObject(value) {
  return isDefined(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if a value is a string
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a string
 */
function isString(value) {
  return isDefined(value) && typeof value === 'string';
}

/**
 * Check if a value is a non-empty string
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a non-empty string
 */
function isNonEmptyString(value) {
  return isString(value) && value.trim().length > 0;
}

/**
 * Check if a value is a number
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a number
 */
function isNumber(value) {
  return isDefined(value) && typeof value === 'number' && !isNaN(value);
}

/**
 * Check if a value is a boolean
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a boolean
 */
function isBoolean(value) {
  return isDefined(value) && typeof value === 'boolean';
}

/**
 * Check if a value is an array
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is an array
 */
function isArray(value) {
  return isDefined(value) && Array.isArray(value);
}

/**
 * Check if a value is a non-empty array
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a non-empty array
 */
function isNonEmptyArray(value) {
  return isArray(value) && value.length > 0;
}

/**
 * Check if a value is a function
 * @param {*} value - Value to check
 * @returns {boolean} True if the value is a function
 */
function isFunction(value) {
  return isDefined(value) && typeof value === 'function';
}

/**
 * Check if a value is a valid email
 * @param {string} value - Value to check
 * @returns {boolean} True if the value is a valid email
 */
function isEmail(value) {
  if (!isString(value)) return false;
  
  // Simple email regex - could be more complex in a real implementation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if a string is a valid URL
 * @param {string} value - Value to check
 * @returns {boolean} True if the value is a valid URL
 */
function isUrl(value) {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Validate an object against a schema
 * @param {Object} object - Object to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
function validateObject(object, schema) {
  if (!isObject(object) || !isObject(schema)) {
    return { 
      valid: false, 
      errors: { _global: 'Invalid object or schema' } 
    };
  }
  
  const errors = {};
  let valid = true;
  
  // Validate required fields
  if (schema.required && isArray(schema.required)) {
    for (const field of schema.required) {
      if (!isDefined(object[field])) {
        errors[field] = `${field} is required`;
        valid = false;
      }
    }
  }
  
  // Validate field types and constraints
  if (schema.properties && isObject(schema.properties)) {
    for (const [field, constraints] of Object.entries(schema.properties)) {
      if (!isDefined(object[field])) continue;
      
      const value = object[field];
      
      // Check type
      if (constraints.type) {
        let typeValid = false;
        
        switch (constraints.type) {
          case 'string':
            typeValid = isString(value);
            break;
          case 'number':
            typeValid = isNumber(value);
            break;
          case 'boolean':
            typeValid = isBoolean(value);
            break;
          case 'array':
            typeValid = isArray(value);
            break;
          case 'object':
            typeValid = isObject(value);
            break;
          case 'function':
            typeValid = isFunction(value);
            break;
          default:
            typeValid = true; // Unknown type, assume valid
        }
        
        if (!typeValid) {
          errors[field] = `${field} must be a ${constraints.type}`;
          valid = false;
          continue; // Skip other validations for this field
        }
      }
      
      // String-specific validations
      if (isString(value)) {
        // Min length
        if (constraints.minLength && value.length < constraints.minLength) {
          errors[field] = `${field} must be at least ${constraints.minLength} characters`;
          valid = false;
        }
        
        // Max length
        if (constraints.maxLength && value.length > constraints.maxLength) {
          errors[field] = `${field} must be at most ${constraints.maxLength} characters`;
          valid = false;
        }
        
        // Pattern
        if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
          errors[field] = `${field} must match pattern ${constraints.pattern}`;
          valid = false;
        }
        
        // Format validation
        if (constraints.format) {
          switch (constraints.format) {
            case 'email':
              if (!isEmail(value)) {
                errors[field] = `${field} must be a valid email`;
                valid = false;
              }
              break;
            case 'url':
              if (!isUrl(value)) {
                errors[field] = `${field} must be a valid URL`;
                valid = false;
              }
              break;
          }
        }
      }
      
      // Number-specific validations
      if (isNumber(value)) {
        // Minimum
        if (isDefined(constraints.minimum) && value < constraints.minimum) {
          errors[field] = `${field} must be at least ${constraints.minimum}`;
          valid = false;
        }
        
        // Maximum
        if (isDefined(constraints.maximum) && value > constraints.maximum) {
          errors[field] = `${field} must be at most ${constraints.maximum}`;
          valid = false;
        }
      }
      
      // Array-specific validations
      if (isArray(value)) {
        // Min items
        if (constraints.minItems && value.length < constraints.minItems) {
          errors[field] = `${field} must have at least ${constraints.minItems} items`;
          valid = false;
        }
        
        // Max items
        if (constraints.maxItems && value.length > constraints.maxItems) {
          errors[field] = `${field} must have at most ${constraints.maxItems} items`;
          valid = false;
        }
        
        // Items validation
        if (constraints.items && isObject(constraints.items)) {
          for (let i = 0; i < value.length; i++) {
            const itemResult = validateObject(value[i], { properties: { item: constraints.items } });
            
            if (!itemResult.valid) {
              errors[`${field}[${i}]`] = itemResult.errors.item || 'Invalid item';
              valid = false;
            }
          }
        }
      }
      
      // Custom validation
      if (isFunction(constraints.validate)) {
        try {
          const customValid = constraints.validate(value);
          
          if (!customValid) {
            errors[field] = constraints.message || `${field} is invalid`;
            valid = false;
          }
        } catch (e) {
          errors[field] = `Error validating ${field}: ${e.message}`;
          valid = false;
        }
      }
    }
  }
  
  return { valid, errors: Object.keys(errors).length > 0 ? errors : null };
}

/**
 * Validate a task object
 * @param {Object} task - Task to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
function validateTask(task) {
  const taskSchema = {
    required: ['id', 'description'],
    properties: {
      id: {
        type: 'string',
        minLength: 1
      },
      description: {
        type: 'string',
        minLength: 10
      },
      type: {
        type: 'string',
        enum: ['ui', 'logic', 'design']
      },
      complexity: {
        type: 'string',
        enum: ['low', 'medium', 'high']
      },
      features: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  };
  
  return validateObject(task, taskSchema);
}

/**
 * Validate a template object
 * @param {Object} template - Template to validate
 * @returns {Object} Validation result { valid: boolean, errors: Object }
 */
function validateTemplate(template) {
  const templateSchema = {
    required: ['template', 'defaults'],
    properties: {
      template: {
        type: 'string',
        minLength: 10
      },
      defaults: {
        type: 'object'
      }
    }
  };
  
  return validateObject(template, templateSchema);
}

module.exports = {
  isDefined,
  isObject,
  isString,
  isNonEmptyString,
  isNumber,
  isBoolean,
  isArray,
  isNonEmptyArray,
  isFunction,
  isEmail,
  isUrl,
  validateObject,
  validateTask,
  validateTemplate
};
