/**
 * AI-AutoCoding-DAO Supabase Connector
 * Handles integration with Supabase for data persistence and authentication
 */
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class SupabaseConnector {
  constructor(config = {}) {
    this.name = 'supabase';
    this.displayName = 'Supabase';
    
    this.config = {
      url: config.url || process.env.SUPABASE_URL,
      apiKey: config.apiKey || process.env.SUPABASE_API_KEY,
      devMode: config.devMode || process.env.NODE_ENV === 'development',
      ...config
    };
    
    // Initialize in-memory storage for dev mode
    if (this.config.devMode) {
      this.devStorage = {
        profiles: new Map(),
        tasks: new Map(),
        tokenUsage: new Map(),
        templates: new Map(),
        implementations: new Map(),
        qualityMetrics: new Map()
      };
      logger.info('Running Supabase connector in development mode');
    } else {
      if (!this.config.url || !this.config.apiKey) {
        logger.error('Missing required Supabase configuration');
        throw new Error('Supabase URL and API key are required in production mode');
      }
      
      this.supabase = createClient(this.config.url, this.config.apiKey);
      logger.info('Supabase connector initialized');
    }
  }

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Sign up result
   */
  async signUp(email, password) {
    try {
      if (this.config.devMode) {
        const userId = `dev_${Date.now()}`;
        this.devStorage.profiles.set(userId, {
          id: userId,
          email,
          created_at: new Date().toISOString()
        });
        return { user: { id: userId, email }, session: null };
      }
      
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Sign up failed:', error);
      throw error;
    }
  }

  /**
   * Sign in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Sign in result
   */
  async signIn(email, password) {
    try {
      if (this.config.devMode) {
        for (const [id, profile] of this.devStorage.profiles) {
          if (profile.email === email) {
            return { user: profile, session: null };
          }
        }
        throw new Error('User not found');
      }
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Sign in failed:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      if (!this.config.devMode) {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error) {
      logger.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param {Object} task - Task details
   * @returns {Promise<Object>} Created task
   */
  async createTask(task) {
    try {
      if (this.config.devMode) {
        const id = `task_${Date.now()}`;
        const newTask = {
          id,
          ...task,
          created_at: new Date().toISOString()
        };
        this.devStorage.tasks.set(id, newTask);
        return newTask;
      }
      
      const { data, error } = await this.supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Task creation failed:', error);
      throw error;
    }
  }

  /**
   * Record token usage
   * @param {Object} usage - Token usage details
   * @returns {Promise<Object>} Created token usage record
   */
  async recordTokenUsage(usage) {
    try {
      if (this.config.devMode) {
        const id = `usage_${Date.now()}`;
        const record = {
          id,
          ...usage,
          created_at: new Date().toISOString()
        };
        this.devStorage.tokenUsage.set(id, record);
        return record;
      }
      
      const { data, error } = await this.supabase
        .from('token_usage')
        .insert(usage)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Token usage recording failed:', error);
      throw error;
    }
  }

  /**
   * Save a template
   * @param {Object} template - Template details
   * @returns {Promise<Object>} Saved template
   */
  async saveTemplate(template) {
    try {
      if (this.config.devMode) {
        const id = `template_${Date.now()}`;
        const newTemplate = {
          id,
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.devStorage.templates.set(id, newTemplate);
        return newTemplate;
      }
      
      const { data, error } = await this.supabase
        .from('templates')
        .upsert({
          ...template,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Template save failed:', error);
      throw error;
    }
  }

  /**
   * Get templates by tool
   * @param {string} toolName - Tool name
   * @returns {Promise<Object[]>} Templates
   */
  async getTemplates(toolName) {
    try {
      if (this.config.devMode) {
        return Array.from(this.devStorage.templates.values())
          .filter(t => t.tool_name === toolName);
      }
      
      const { data, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('tool_name', toolName);
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Template retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Save an implementation
   * @param {Object} implementation - Implementation details
   * @returns {Promise<Object>} Saved implementation
   */
  async saveImplementation(implementation) {
    try {
      if (this.config.devMode) {
        const id = `impl_${Date.now()}`;
        const newImpl = {
          id,
          ...implementation,
          created_at: new Date().toISOString()
        };
        this.devStorage.implementations.set(id, newImpl);
        return newImpl;
      }
      
      const { data, error } = await this.supabase
        .from('implementations')
        .insert(implementation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Implementation save failed:', error);
      throw error;
    }
  }

  /**
   * Save quality metrics
   * @param {Object} metrics - Quality metrics details
   * @returns {Promise<Object>} Saved quality metrics
   */
  async saveQualityMetrics(metrics) {
    try {
      if (this.config.devMode) {
        const id = `metrics_${Date.now()}`;
        const newMetrics = {
          id,
          ...metrics,
          created_at: new Date().toISOString()
        };
        this.devStorage.qualityMetrics.set(id, newMetrics);
        return newMetrics;
      }
      
      const { data, error } = await this.supabase
        .from('quality_metrics')
        .insert(metrics)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Quality metrics save failed:', error);
      throw error;
    }
  }

  /**
   * Get task history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object[]>} Task history
   */
  async getTaskHistory(userId) {
    try {
      if (this.config.devMode) {
        return Array.from(this.devStorage.tasks.values())
          .filter(t => t.user_id === userId);
      }
      
      const { data, error } = await this.supabase
        .from('tasks')
        .select(`
          *,
          token_usage (*),
          implementations (
            *,
            quality_metrics (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Task history retrieval failed:', error);
      throw error;
    }
  }
}

module.exports = SupabaseConnector;