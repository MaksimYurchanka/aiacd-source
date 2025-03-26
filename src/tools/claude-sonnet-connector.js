/**
 * AI-AutoCoding-DAO Claude Sonnet Connector
 * Handles interaction with Claude Sonnet API for task implementations
 */
const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

class ClaudeSonnetConnector {
  constructor(config = {}) {
    this.name = 'claudeSonnet';
    this.displayName = 'Claude Sonnet';
    
    this.config = {
      maxTokens: 10000,
      temperature: 0.7,
      apiKey: config.apiKey || process.env.CLAUDE_API_KEY,
      baseUrl: config.baseUrl || process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1',
      modelVersion: config.modelVersion || process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
      ...config
    };
    
    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl
    });
    
    // Validate config
    if (!this.config.apiKey) {
      logger.error('No API key provided for Claude Sonnet');
      throw new Error('Claude Sonnet API key is required');
    }
  }

  /**
   * Get tool capabilities
   * @returns {Object} Tool capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      displayName: this.displayName,
      strengths: [
        'code-generation',
        'code-analysis',
        'optimization',
        'documentation'
      ],
      maxTokens: this.config.maxTokens,
      modelVersion: this.config.modelVersion
    };
  }

  /**
   * Implement a task using Claude Sonnet
   * @param {Object} task - Task details
   * @param {string} template - Filled template
   * @returns {Promise<Object>} Implementation results
   */
  async implementTask(task, template) {
    try {
      logger.info(`Implementing task with Claude Sonnet: ${task.id}`);
      
      // Prepare the prompt
      const prompt = this._preparePrompt(task, template);
      
      // Make API call
      const response = await this.client.messages.create({
        model: this.config.modelVersion,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      // Extract implementation from response
      const implementation = this._extractImplementation(response);
      
      // Track token usage
      const tokenUsage = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      };
      
      return {
        success: true,
        implementation,
        tokenUsage,
        metadata: {
          tool: this.name,
          timestamp: new Date().toISOString(),
          taskId: task.id,
          modelVersion: this.config.modelVersion
        }
      };
    } catch (error) {
      logger.error(`Claude Sonnet implementation failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Prepare a prompt for Claude Sonnet
   * @private
   * @param {Object} task - Task details
   * @param {string} template - Filled template
   * @returns {string} Complete prompt
   */
  _preparePrompt(task, template) {
    return `
# AI-AutoCoding-DAO Task Implementation

You are a skilled developer tasked with creating a precise implementation based on the following requirements.
Focus on creating high-quality, clean code that follows best practices.

${template}

## Implementation Guidelines
- Create a complete implementation that fulfills all requirements
- Follow modern development best practices
- Include helpful comments for complex logic
- Ensure the code is well-structured and maintainable
- Consider edge cases and error handling

## Response Format
Provide your implementation in the following format:

\`\`\`[language]
// Your implementation here
\`\`\`

Then add a brief explanation of your implementation approach and any notable design decisions.
`;
  }
  
  /**
   * Extract implementation from API response
   * @private
   * @param {Object} response - API response
   * @returns {string} Extracted implementation
   */
  _extractImplementation(response) {
    const content = response.content[0]?.text || '';
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    
    if (matches.length === 0) {
      throw new Error('No code implementation found in response');
    }
    
    // Return the largest code block
    return matches.reduce((largest, match) => 
      match[1].length > largest.length ? match[1] : largest
    , matches[0][1]);
  }
}

module.exports = ClaudeSonnetConnector;