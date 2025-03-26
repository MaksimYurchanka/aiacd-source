import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Anthropic } from 'npm:@anthropic-ai/sdk@0.10.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TaskRequest {
  taskId: string;
  description: string;
  implementation: string;
  metadata: {
    type: string;
    complexity: string;
    features: string[];
  };
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !claudeApiKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    // Parse request body
    const taskRequest: TaskRequest = await req.json();

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: claudeApiKey,
    });

    // Execute implementation
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Execute the following implementation:
          Task: ${taskRequest.description}
          Implementation: ${taskRequest.implementation}
          
          Provide the execution result and any relevant output.`
      }]
    });

    // Record execution in database
    const { data: executionData, error: executionError } = await supabase
      .from('implementations')
      .insert({
        task_id: taskRequest.taskId,
        tool_name: 'bolt-diy',
        code: taskRequest.implementation,
        metadata: {
          ...taskRequest.metadata,
          execution_result: response.content[0].text,
          execution_time: Date.now(),
        }
      })
      .select()
      .single();

    if (executionError) {
      throw executionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: response.content[0].text,
        implementation: executionData
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});