import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface ItineraryRequest {
  destinations: string[];
  startDate: string;
  endDate: string;
  budget: 'Budget' | 'Mid-range' | 'Luxury';
  interests: string[];
  currency: string;
}

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  costEstimate: string;
  tips: string;
  category: string;
}

interface DayItinerary {
  day: number;
  date: string;
  activities: Activity[];
  totalEstimatedCost: string;
}

interface AIItineraryResponse {
  destination: string;
  days: DayItinerary[];
  totalBudget: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const createPrompt = (formData: ItineraryRequest): string => {
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const destinationsText = formData.destinations.join(', ');
  const isMultiCity = formData.destinations.length > 1;

  return `Create a detailed ${diffDays}-day travel itinerary for ${destinationsText}.

${isMultiCity ? `This is a multi-city trip covering: ${destinationsText}. Please distribute the days appropriately across all destinations, including travel time between cities.` : ''}

Trip Details:
- Destination${isMultiCity ? 's' : ''}: ${destinationsText}
- Start Date: ${formData.startDate}
- End Date: ${formData.endDate}
- Budget Level: ${formData.budget}
- Interests: ${formData.interests.join(', ')}
- Currency: ${formData.currency}

Please provide a JSON response with the following structure:
{
  "destination": "${destinationsText}",
  "days": [
    {
      "day": 1,
      "date": "formatted date (e.g., Monday, January 1, 2024)",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity Title",
          "description": "Detailed description of the activity (2-3 sentences)",
          "location": "Specific location with address if possible",
          "costEstimate": "Cost range in ${formData.currency} (e.g., $15-25)",
          "tips": "Helpful practical tips for this activity",
          "category": "Culture/Food/Nature/Adventure/Shopping/History/Art/etc"
        }
      ],
      "totalEstimatedCost": "Daily total cost range in ${formData.currency}"
    }
  ],
  "totalBudget": "Total trip budget range in ${formData.currency}"
}

Requirements:
- Include 4-6 activities per day with varied timing
${isMultiCity ? '- Distribute days across all destinations with appropriate travel time' : ''}
${isMultiCity ? '- Include transportation between cities in the itinerary' : ''}
- Mix different types of activities based on user interests: ${formData.interests.join(', ')}
- Provide realistic cost estimates for ${formData.budget} budget level
- Provide practical, actionable tips for each activity
- Consider travel time between activities${isMultiCity ? ' and between cities' : ''}
- Make recommendations authentic and specific to ${destinationsText}
- Format all costs in ${formData.currency} currency
- Ensure activities align with the selected interests
- Include a good mix of must-see attractions and hidden gems
- Consider the time of year and local customs
- Provide opening hours and booking information in tips when relevant
- IMPORTANT: Always include the city name in location field (format: "Location Name, City Name")
- CRITICAL: For multi-city trips, clearly specify which city each activity is in
- EXAMPLE: "Historic City Center, Goa" or "Marine Drive, Mumbai" - never just "City Center"

IMPORTANT: Respond with ONLY valid JSON, no additional text or formatting.`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Parse request body
    const requestData: ItineraryRequest = await req.json()
    
    // Validate required fields
    if (!requestData.destinations || requestData.destinations.length === 0 || !requestData.startDate || !requestData.endDate || !requestData.budget) {
      throw new Error('Missing required fields')
    }

    console.log('Generating itinerary for:', requestData.destinations.join(', '))

    // Create the prompt
    const prompt = createPrompt(requestData)

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner with extensive knowledge of destinations worldwide. Create detailed, personalized travel itineraries with specific recommendations, realistic costs, and practical tips. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', openaiResponse.status, errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    console.log('Raw OpenAI response:', content)

    // Parse the JSON response
    let aiItinerary: AIItineraryResponse
    try {
      // Extract JSON from OpenAI response (handle markdown code blocks and extra text)
      let jsonString = content.trim()
      
      // Check if content is wrapped in markdown code blocks
      if (jsonString.includes('```json')) {
        const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1].trim()
        }
      } else if (jsonString.includes('```')) {
        // Handle generic code blocks
        const codeMatch = jsonString.match(/```\s*([\s\S]*?)\s*```/)
        if (codeMatch && codeMatch[1]) {
          jsonString = codeMatch[1].trim()
        }
      }
      
      // If still not pure JSON, try to extract JSON object between first { and last }
      if (!jsonString.startsWith('{')) {
        const firstBrace = jsonString.indexOf('{')
        const lastBrace = jsonString.lastIndexOf('}')
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1)
        }
      }
      
      console.log('Extracted JSON string:', jsonString)
      aiItinerary = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Content that failed to parse:', content)
      console.error('Extracted JSON string that failed:', jsonString)
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Transform AI response to our format
    const itinerary = {
      id: Date.now().toString(),
      destination: aiItinerary.destination,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      preferences: {
        budget: requestData.budget,
        interests: requestData.interests
      },
      days: aiItinerary.days.map((day: DayItinerary) => ({
        ...day,
        activities: day.activities.map((activity: Activity) => ({
          ...activity,
          costEstimate: activity.costEstimate || 'Free'
        }))
      })),
      totalBudget: aiItinerary.totalBudget,
      createdAt: new Date().toISOString()
    }

    console.log('Successfully generated itinerary for:', requestData.destination)
    console.log('Successfully generated itinerary for:', requestData.destinations.join(', '))

    return new Response(
      JSON.stringify(itinerary),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error in generate-itinerary function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate itinerary'
      }),
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