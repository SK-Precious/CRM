import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const { base64Image, mimeType = "image/jpeg" } = await req.json()

    if (!base64Image) {
      throw new Error('No image provided')
    }

    const prompt = `Extract all booking fields from this form image. Return ONLY a valid JSON object matching this schema exactly:
    {
      "name": "string",
      "contact": "string",
      "contact2": "string or null",
      "dob": "YYYY-MM-DD or null",
      "menu": "string",
      "dof": "YYYY-MM-DD or null",
      "pax": "integer",
      "hall": "string",
      "occasion": "string",
      "timings": "string",
      "meal": "string",
      "dj": "boolean",
      "liquor": "boolean",
      "flower_decor": "boolean",
      "theme": "string",
      "extra_plates": "integer",
      "total_amount": "number",
      "customer_btr": "number",
      "remarks": "string"
    }
    If a field is unseen or uncertain, infer reasonably or return null rather than failing.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image.replace(/^data:image\/\w+;base64,/, '')
              }
            }
          ]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${data.error?.message || 'Unknown state'}`)
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    const resultJson = JSON.parse(rawText)

    return new Response(
      JSON.stringify(resultJson),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
