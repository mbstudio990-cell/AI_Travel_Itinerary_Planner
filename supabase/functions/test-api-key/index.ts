import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    console.log('Environment variables check:')
    console.log('OPENAI_API_KEY exists:', !!openaiApiKey)
    console.log('OPENAI_API_KEY length:', openaiApiKey?.length || 0)
    console.log('OPENAI_API_KEY starts with sk-:', openaiApiKey?.startsWith('sk-') || false)
    
    // Don't expose the actual key, just check if it exists and format
    const response = {
      success: true,
      hasApiKey: !!openaiApiKey,
      keyLength: openaiApiKey?.length || 0,
      startsWithSk: openaiApiKey?.startsWith('sk-') || false,
      keyPreview: openaiApiKey ? `${openaiApiKey.substring(0, 7)}...${openaiApiKey.substring(openaiApiKey.length - 4)}` : null,
      timestamp: new Date().toISOString(),
      allEnvVars: Object.keys(Deno.env.toObject()).sort()
    }

    // Test a simple OpenAI API call if key exists
    if (openaiApiKey && openaiApiKey.startsWith('sk-')) {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`
          }
        })
        
        response.apiTest = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          success: testResponse.ok
        }
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text()
          response.apiTest.error = errorText
        }
      } catch (apiError) {
        response.apiTest = {
          error: apiError.message,
          success: false
        }
      }
    }

    return new Response(
      JSON.stringify(response, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error in test-api-key function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }, null, 2),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})