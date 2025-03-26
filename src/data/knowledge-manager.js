/**
 * AI-AutoCoding-DAO Knowledge Manager
 * Manages knowledge artifacts for the AI-AutoCoding-DAO system
 */
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Knowledge Manager class for handling knowledge artifacts
 */
class KnowledgeManager {
  /**
   * Create a Knowledge Manager instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      baseDir: path.resolve(process.cwd()),
      templatesDir: 'src/data/templates',
      patternsDir: 'src/data/patterns',
      ...config
    };
    
    // Ensure paths are absolute
    if (!path.isAbsolute(this.config.templatesDir)) {
      this.config.templatesDir = path.join(this.config.baseDir, this.config.templatesDir);
    }
    
    if (!path.isAbsolute(this.config.patternsDir)) {
      this.config.patternsDir = path.join(this.config.baseDir, this.config.patternsDir);
    }
    
    this.templates = {};
    this.patterns = {};
  }
  
  /**
   * Initialize the knowledge manager
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      logger.info('Initializing knowledge manager');
      
      // Ensure directories exist
      await this._ensureDirectories();
      
      // Load templates
      await this._loadTemplates();
      
      // Load patterns
      await this._loadPatterns();
      
      logger.info('Knowledge manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize knowledge manager', error);
      throw error;
    }
  }
  
  /**
   * Ensure required directories exist
   * @private
   * @returns {Promise<void>}
   */
  async _ensureDirectories() {
    try {
      // Ensure templates directory
      await fs.mkdir(this.config.templatesDir, { recursive: true });
      
      // Ensure patterns directory
      await fs.mkdir(this.config.patternsDir, { recursive: true });
      
      // Ensure tool-specific template directories
      const toolDirs = ['haiku', 'bolt-new', 'v0-dev', 'claude-direct'];
      
      for (const toolDir of toolDirs) {
        await fs.mkdir(path.join(this.config.templatesDir, toolDir), { recursive: true });
      }
    } catch (error) {
      logger.error('Failed to ensure directories', error);
      throw error;
    }
  }
  
  /**
   * Load templates from disk
   * @private
   * @returns {Promise<void>}
   */
  async _loadTemplates() {
    try {
      logger.info('Loading templates');
      
      // Get tool directories
      const toolDirs = await fs.readdir(this.config.templatesDir);
      
      for (const toolDir of toolDirs) {
        const toolPath = path.join(this.config.templatesDir, toolDir);
        const stats = await fs.stat(toolPath);
        
        if (stats.isDirectory()) {
          this.templates[toolDir] = {};
          
          // Read template files
          try {
            const templateFiles = await fs.readdir(toolPath);
            
            for (const templateFile of templateFiles) {
              if (templateFile.endsWith('.json')) {
                try {
                  const templateContent = await fs.readFile(path.join(toolPath, templateFile), 'utf8');
                  const templateName = templateFile.replace('.json', '');
                  
                  this.templates[toolDir][templateName] = JSON.parse(templateContent);
                  
                  logger.debug(`Loaded template: ${toolDir}/${templateName}`);
                } catch (e) {
                  logger.warn(`Failed to load template: ${toolDir}/${templateFile}`, e);
                }
              }
            }
          } catch (e) {
            logger.warn(`Failed to read templates for tool: ${toolDir}`, e);
          }
        }
      }
      
      logger.info(`Loaded ${Object.keys(this.templates).length} tool template sets`);
    } catch (error) {
      logger.error('Failed to load templates', error);
      throw error;
    }
  }
  
  /**
   * Load patterns from disk
   * @private
   * @returns {Promise<void>}
   */
  async _loadPatterns() {
    try {
      logger.info('Loading patterns');
      
      // Read pattern files
      try {
        const patternFiles = await fs.readdir(this.config.patternsDir);
        
        for (const patternFile of patternFiles) {
          if (patternFile.endsWith('.json')) {
            try {
              const patternContent = await fs.readFile(path.join(this.config.patternsDir, patternFile), 'utf8');
              const patternName = patternFile.replace('.json', '');
              
              this.patterns[patternName] = JSON.parse(patternContent);
              
              logger.debug(`Loaded pattern: ${patternName}`);
            } catch (e) {
              logger.warn(`Failed to load pattern: ${patternFile}`, e);
            }
          }
        }
      } catch (e) {
        logger.warn('Failed to read patterns directory', e);
      }
      
      logger.info(`Loaded ${Object.keys(this.patterns).length} patterns`);
    } catch (error) {
      logger.error('Failed to load patterns', error);
      throw error;
    }
  }
  
  /**
   * Get a template by tool and type
   * @param {string} tool - Tool name
   * @param {string} type - Template type
   * @returns {Object|null} Template or null if not found
   */
  getTemplate(tool, type) {
    return this.templates[tool]?.[type] || null;
  }
  
  /**
   * Save a template
   * @param {string} tool - Tool name
   * @param {string} type - Template type
   * @param {Object} template - Template object
   * @returns {Promise<boolean>} Success
   */
  async saveTemplate(tool, type, template) {
    try {
      // Ensure tool directory exists
      const toolPath = path.join(this.config.templatesDir, tool);
      await fs.mkdir(toolPath, { recursive: true });
      
      // Write template file
      await fs.writeFile(
        path.join(toolPath, `${type}.json`),
        JSON.stringify(template, null, 2),
        'utf8'
      );
      
      // Update in-memory template
      if (!this.templates[tool]) {
        this.templates[tool] = {};
      }
      
      this.templates[tool][type] = template;
      
      logger.info(`Saved template: ${tool}/${type}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to save template: ${tool}/${type}`, error);
      return false;
    }
  }
  
  /**
   * Get a pattern by name
   * @param {string} name - Pattern name
   * @returns {Object|null} Pattern or null if not found
   */
  getPattern(name) {
    return this.patterns[name] || null;
  }
  
  /**
   * Save a pattern
   * @param {string} name - Pattern name
   * @param {Object} pattern - Pattern object
   * @returns {Promise<boolean>} Success
   */
  async savePattern(name, pattern) {
    try {
      // Write pattern file
      await fs.writeFile(
        path.join(this.config.patternsDir, `${name}.json`),
        JSON.stringify(pattern, null, 2),
        'utf8'
      );
      
      // Update in-memory pattern
      this.patterns[name] = pattern;
      
      logger.info(`Saved pattern: ${name}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to save pattern: ${name}`, error);
      return false;
    }
  }
  
  /**
   * Get all templates for a tool
   * @param {string} tool - Tool name
   * @returns {Object} Templates
   */
  getToolTemplates(tool) {
    return this.templates[tool] || {};
  }
  
  /**
   * Get all templates
   * @returns {Object} All templates
   */
  getAllTemplates() {
    return this.templates;
  }
  
  /**
   * Get all patterns
   * @returns {Object} All patterns
   */
  getAllPatterns() {
    return this.patterns;
  }
  
  /**
   * Delete a template
   * @param {string} tool - Tool name
   * @param {string} type - Template type
   * @returns {Promise<boolean>} Success
   */
  async deleteTemplate(tool, type) {
    try {
      // Check if template exists
      if (!this.templates[tool]?.[type]) {
        logger.warn(`Template not found: ${tool}/${type}`);
        return false;
      }
      
      // Delete template file
      await fs.unlink(path.join(this.config.templatesDir, tool, `${type}.json`));
      
      // Remove from in-memory templates
      delete this.templates[tool][type];
      
      logger.info(`Deleted template: ${tool}/${type}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to delete template: ${tool}/${type}`, error);
      return false;
    }
  }
  
  /**
   * Delete a pattern
   * @param {string} name - Pattern name
   * @returns {Promise<boolean>} Success
   */
  async deletePattern(name) {
    try {
      // Check if pattern exists
      if (!this.patterns[name]) {
        logger.warn(`Pattern not found: ${name}`);
        return false;
      }
      
      // Delete pattern file
      await fs.unlink(path.join(this.config.patternsDir, `${name}.json`));
      
      // Remove from in-memory patterns
      delete this.patterns[name];
      
      logger.info(`Deleted pattern: ${name}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to delete pattern: ${name}`, error);
      return false;
    }
  }
}

module.exports = KnowledgeManager;
