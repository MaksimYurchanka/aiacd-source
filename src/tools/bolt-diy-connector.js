/**
 * AI-AutoCoding-DAO bolt.diy Connector
 * Handles integration with bolt.diy deployed on Supabase
 */
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class BoltDiyConnector {
  constructor(config = {}) {
    this.name = 'boltDiy';
    this.displayName = 'bolt.diy';
    
    this.config = {
      url: config.url || process.env.SUPABASE_URL,
      apiKey: config.apiKey || process.env.SUPABASE_ANON_KEY,
      devMode: config.devMode || process.env.NODE_ENV === 'development',
      ...config
    };
    
    if (!this.config.devMode && (!this.config.url || !this.config.apiKey)) {
      logger.error('Missing required bolt.diy configuration');
      throw new Error('bolt.diy URL and API key are required in production mode');
    }

    // Initialize Supabase client for file storage
    if (!this.config.devMode) {
      this.supabase = createClient(this.config.url, this.config.apiKey);
    }
  }

  /**
   * Execute a task using bolt.diy
   * @param {Object} task - Task details
   * @param {Object} implementation - Implementation details
   * @returns {Promise<Object>} Execution results
   */
  async executeTask(task, implementation) {
    try {
      logger.info(`Executing task with bolt.diy: ${task.id}`);
      
      if (this.config.devMode) {
        return this._simulateExecution(task, implementation);
      }
      
      // Upload any project files to Supabase Storage
      const fileUrls = await this._uploadProjectFiles(task.id, implementation.files || []);
      
      const response = await fetch(`${this.config.url}/functions/v1/bolt-diy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          taskId: task.id,
          description: task.description,
          implementation: implementation.implementation,
          metadata: {
            type: task.type,
            complexity: task.complexity,
            features: task.features,
            fileUrls
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`bolt.diy execution failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        result: result.result,
        implementation: result.implementation,
        fileUrls,
        metadata: {
          tool: this.name,
          timestamp: new Date().toISOString(),
          taskId: task.id
        }
      };
    } catch (error) {
      logger.error(`bolt.diy execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload project files to Supabase Storage
   * @private
   * @param {string} taskId - Task identifier
   * @param {Array} files - Array of file objects
   * @returns {Promise<Object>} Uploaded file URLs
   */
  async _uploadProjectFiles(taskId, files) {
    if (this.config.devMode || !files.length) {
      return {};
    }

    try {
      const fileUrls = {};
      
      for (const file of files) {
        const filePath = `${taskId}/${file.name}`;
        const { data, error } = await this.supabase.storage
          .from('bolt-diy-projects')
          .upload(filePath, file.content, {
            contentType: file.type || 'text/plain',
            upsert: true
          });

        if (error) throw error;

        const { data: urlData } = await this.supabase.storage
          .from('bolt-diy-projects')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        fileUrls[file.name] = urlData.signedUrl;
      }

      return fileUrls;
    } catch (error) {
      logger.error(`File upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download project files from Supabase Storage
   * @param {string} taskId - Task identifier
   * @returns {Promise<Array>} Downloaded files
   */
  async downloadProjectFiles(taskId) {
    if (this.config.devMode) {
      return [];
    }

    try {
      const { data: files, error } = await this.supabase.storage
        .from('bolt-diy-projects')
        .list(taskId);

      if (error) throw error;

      const downloadedFiles = [];
      
      for (const file of files) {
        const { data, error: downloadError } = await this.supabase.storage
          .from('bolt-diy-projects')
          .download(`${taskId}/${file.name}`);

        if (downloadError) throw downloadError;

        downloadedFiles.push({
          name: file.name,
          content: await data.text(),
          type: file.metadata?.mimetype || 'text/plain'
        });
      }

      return downloadedFiles;
    } catch (error) {
      logger.error(`File download failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Simulate execution for development mode
   * @private
   * @param {Object} task - Task details
   * @param {Object} implementation - Implementation details
   * @returns {Promise<Object>} Simulated execution results
   */
  async _simulateExecution(task, implementation) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      result: {
        status: 'completed',
        output: 'Development mode execution simulation',
        metrics: {
          executionTime: 500,
          memoryUsage: 1024,
          cpuUsage: 0.5
        }
      },
      metadata: {
        tool: this.name,
        timestamp: new Date().toISOString(),
        taskId: task.id,
        devMode: true
      }
    };
  }
}

module.exports = BoltDiyConnector;