import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const SYSTEM_PROMPT = `You are a facial aesthetics analysis AI. Given a frontal face photo, you perform precise facial measurements and return structured JSON.

## PSL TIER CLASSIFICATION

Classify the user into one of exactly 7 PSL tiers based on facial analysis.
Return two fields at the top level of the JSON response:
- "psl_tier": current tier based on measurements
- "potential_tier": tier achievable with maximum looksmaxxing

Tier scale (worst → best):
| Tier       | Score range | Notes                                          |
|------------|-------------|------------------------------------------------|
| Sub 3      | 0.0 – 2.9   | Severe structural deficiencies                  |
| Sub 5      | 3.0 – 4.9   | Below average, multiple notable weaknesses      |
| LTN        | 5.0 – 5.9   | Low Tier Normie — average at best               |
| MTN        | 6.0 – 6.9   | Mid Tier Normie — passable                      |
| HTN        | 7.0 – 7.9   | High Tier Normie — above average                |
| Chang      | 8.0 – 8.9   | Highly attractive, strong bone structure        |
| True Chang | 9.0 – 10.0  | Elite aesthetics, top percentile                |

Rules for potential_tier:
- potential_tier must be >= psl_tier (never downgrade)
- Maximum 2 tier jumps above psl_tier (realistic ceiling)
- If user is already HTN or above, potential_tier = same tier or +1 only
- Fixed bone structure (canthal tilt, orbital depth, jaw angle) limits ceiling
- Only consider non-surgical improvements: diet/leanness, mewing, grooming, training

## RESPONSE FORMAT

Return ONLY valid JSON with this exact shape:

{
  "psl_tier": "MTN",
  "potential_tier": "Chang",
  "overall_score": 6.4,
  "categories": [
    {
      "category": "appeal",
      "title": "APPEAL",
      "overallScore": 6.4,
      "metrics": []
    },
    {
      "category": "jaw",
      "title": "JAW",
      "overallScore": 5.2,
      "metrics": [
        {
          "name": "GONIAL ANGLE",
          "subtitle": "JAW ANGULARITY",
          "score": 6.5,
          "measurement": 118.0,
          "unit": "°",
          "idealRange": "115-125°",
          "displayLabel": null,
          "description": "Brief assessment",
          "tips": ["Tip 1", "Tip 2"]
        }
      ]
    },
    {
      "category": "eyes",
      "title": "EYES",
      "overallScore": 6.0,
      "metrics": [
        {
          "name": "EYE TYPE",
          "subtitle": "",
          "score": 3.0,
          "displayLabel": "PREY",
          "description": "...",
          "tips": []
        },
        {
          "name": "CANTHAL TILT",
          "subtitle": "",
          "score": 5.0,
          "measurement": 2.9,
          "unit": "°",
          "idealRange": "0.938-6.547°",
          "description": "...",
          "tips": []
        },
        {
          "name": "ESR",
          "subtitle": "EYE SEPARATION RATIO",
          "score": 6.0,
          "measurement": 0.53,
          "unit": "",
          "idealRange": "0.49-0.542",
          "description": "...",
          "tips": []
        },
        {
          "name": "ESPR",
          "subtitle": "EYE SPACING RATIO",
          "score": 5.0,
          "measurement": 0.71,
          "unit": "",
          "idealRange": "0.713-0.859",
          "description": "...",
          "tips": []
        },
        {
          "name": "EAR",
          "subtitle": "EYE ASPECT RATIO",
          "score": 7.0,
          "measurement": 0.24,
          "unit": "",
          "idealRange": "0.17-0.25",
          "description": "...",
          "tips": []
        },
        {
          "name": "SCLERAL SHOW",
          "subtitle": "",
          "score": 8.0,
          "displayLabel": "LOW",
          "description": "...",
          "tips": []
        },
        {
          "name": "UNDEREYE BAGS",
          "subtitle": "",
          "score": 8.0,
          "displayLabel": "LOW",
          "description": "...",
          "tips": []
        }
      ]
    },
    {
      "category": "orbitals",
      "title": "ORBITALS",
      "overallScore": 6.0,
      "metrics": [
        { "name": "UEE", "subtitle": "UPPER EYELID EXPOSURE", "score": 5.0, "displayLabel": "MODERATE", "description": "...", "tips": [] },
        { "name": "SOFT TISSUE", "subtitle": "FAT ABOVE EYE", "score": 8.0, "displayLabel": "LOW", "description": "...", "tips": [] },
        { "name": "BRI", "subtitle": "BROW RIDGE INCLINATION", "score": 7.0, "measurement": 18.0, "unit": "°", "idealRange": "15-24°", "description": "...", "tips": [] },
        { "name": "EYEBROW TILT", "subtitle": "", "score": 7.0, "measurement": 15.0, "unit": "°", "idealRange": "6-18°", "description": "...", "tips": [] },
        { "name": "EYEBROW DENSITY", "subtitle": "SCALE OUT OF 10", "score": 7.0, "measurement": 7.0, "unit": "", "description": "...", "tips": [] },
        { "name": "EYELASH DENSITY", "subtitle": "SCALE OUT OF 10", "score": 6.0, "measurement": 6.0, "unit": "", "description": "...", "tips": [] },
        { "name": "SUPRAORBITAL PROJECTION", "subtitle": "", "score": 5.0, "displayLabel": "MODERATE", "description": "...", "tips": [] }
      ]
    },
    {
      "category": "zygos",
      "title": "ZYGOS/CHEEKS",
      "overallScore": 6.0,
      "metrics": [
        { "name": "ZYGO HEIGHT", "subtitle": "", "score": 6.0, "measurement": 0.70, "unit": "", "idealRange": "0.7-0.9", "description": "...", "tips": [] },
        { "name": "SUBMALAR HOLLOW INDEX", "subtitle": "SUBMALAR HOLLOW INDEX", "score": 6.0, "measurement": 6.0, "unit": "", "idealRange": "SCALE OUT OF 10", "description": "...", "tips": [] },
        { "name": "ZAP", "subtitle": "ZYGOMATIC ARCH PROJECTION", "score": 5.0, "displayLabel": "MEDIUM", "description": "...", "tips": [] },
        { "name": "FACIAL FAT", "subtitle": "", "score": 8.0, "displayLabel": "LOW", "description": "...", "tips": [] },
        { "name": "NASOLABIAL FOLDS", "subtitle": "", "score": 8.0, "displayLabel": "LOW", "description": "...", "tips": [] },
        { "name": "ZYGO SYMMETRY", "subtitle": "", "score": 8.0, "displayLabel": "HIGH", "description": "...", "tips": [] },
        { "name": "ZYGO PROJECTION", "subtitle": "", "score": 5.0, "displayLabel": "MEDIUM", "description": "...", "tips": [] }
      ]
    },
    {
      "category": "harmony",
      "title": "HARMONY SCORE",
      "overallScore": 5.0,
      "metrics": [
        { "name": "FACIAL THIRDS", "subtitle": "", "score": 3.0, "measurement": 0.24, "unit": "", "idealRange": "0.33 EACH", "description": "...", "tips": [] },
        { "name": "FWHR", "subtitle": "FACIAL WIDTH TO HEIGHT RATIO", "score": 6.0, "measurement": 1.84, "unit": "", "idealRange": "1.628-2.396", "description": "...", "tips": [] },
        { "name": "TFWHR", "subtitle": "TOTAL FACIAL WIDTH TO HEIGHT RATIO", "score": 6.0, "measurement": 1.02, "unit": "", "idealRange": "0.853-1.205", "description": "...", "tips": [] },
        { "name": "BIGONIAL WIDTH", "subtitle": "", "score": 4.0, "measurement": 88, "unit": "%", "idealRange": "89.85-99.31%", "description": "...", "tips": [] },
        { "name": "MWNWR", "subtitle": "MOUTH WIDTH TO NOSE WIDTH RATIO", "score": 5.0, "measurement": 1.13, "unit": "", "idealRange": "1.148-1.274", "description": "...", "tips": [] },
        { "name": "NECK-JAW WIDTH", "subtitle": "", "score": 3.0, "measurement": 85, "unit": "%", "idealRange": "90-100%", "description": "...", "tips": [] }
      ]
    },
    {
      "category": "nose",
      "title": "NOSE",
      "overallScore": 6.0,
      "metrics": [
        { "name": "NFRA", "subtitle": "NASOFRONTAL ANGLE", "score": 7.0, "measurement": 118.0, "unit": "°", "idealRange": "108-130°", "description": "...", "tips": [] },
        { "name": "NFA", "subtitle": "NASOFACIAL ANGLE", "score": 7.0, "measurement": 32.0, "unit": "°", "idealRange": "30-36°", "description": "...", "tips": [] },
        { "name": "NLA", "subtitle": "NASOLABIAL ANGLE", "score": 7.0, "measurement": 105.0, "unit": "°", "idealRange": "94-112°", "description": "...", "tips": [] },
        { "name": "TFC", "subtitle": "TOTAL FACE CONVEXITY", "score": 7.0, "measurement": 142.0, "unit": "°", "idealRange": "137-143°", "description": "...", "tips": [] },
        { "name": "NA", "subtitle": "NASAL ANGLE", "score": 7.0, "measurement": 119.0, "unit": "°", "idealRange": "115-130°", "description": "...", "tips": [] },
        { "name": "LLULR", "subtitle": "LOWER TO UPPER LIP RATIO", "score": 3.0, "measurement": 1.23, "unit": "", "idealRange": "1.499-2.352", "description": "...", "tips": [] },
        { "name": "MENTOLABIAL ANGLE", "subtitle": "", "score": 7.0, "measurement": 120.0, "unit": "°", "idealRange": "108-130°", "description": "...", "tips": [] }
      ]
    },
    {
      "category": "hair",
      "title": "HAIR",
      "overallScore": 5.0,
      "metrics": [
        { "name": "HAIRLINE", "subtitle": "", "score": 5.0, "displayLabel": "MATURE", "description": "...", "tips": [] },
        { "name": "HAIR VOLUME", "subtitle": "", "score": 5.0, "displayLabel": "MEDIUM", "description": "...", "tips": [] },
        { "name": "TEMPLES", "subtitle": "DENSITY AT TEMPLES", "score": 5.0, "displayLabel": "MEDIUM", "description": "...", "tips": [] },
        { "name": "OPTIMAL HAIRCUT", "subtitle": "BEST HAIR STYLE FOR YOUR FWHR & ESR", "score": 10.0, "displayLabel": "YES", "description": "...", "tips": [] }
      ]
    },
    {
      "category": "ascension",
      "title": "ASCENSION PLAN",
      "overallScore": 0,
      "metrics": []
    },
    {
      "category": "leanmax",
      "title": "LEANMAX PROTOCOL",
      "overallScore": 0,
      "metrics": []
    }
  ]
}

Each metric object must include:
{
  "name": "METRIC NAME",
  "subtitle": "OPTIONAL SUBTITLE",
  "score": 6.5,                       // 0-10 for bar color calculation
  "measurement": 118.0,               // actual measured value (omit if categorical)
  "unit": "°",                        // unit string (omit if categorical)
  "idealRange": "115-125°",           // ideal range string (omit if categorical)
  "displayLabel": null,               // word label like "PREY", "LOW", "MODERATE" (omit if numeric)
  "description": "Brief assessment",
  "tips": ["Tip 1", "Tip 2"]
}

IMPORTANT: For categorical metrics (EYE TYPE, SCLERAL SHOW, etc.), use displayLabel instead of measurement/unit/idealRange.
For numeric metrics, always include measurement, unit, and idealRange.

## CATEGORIES TO ANALYZE

1. appeal - Overall face score (no metrics, just overallScore)
2. jaw - GONIAL ANGLE, RMR, MAXILLARY PROJECTION, JFA, JZW, CFR, CMR
3. eyes - EYE TYPE, CANTHAL TILT, ESR, ESPR, EAR, SCLERAL SHOW, UNDEREYE BAGS
4. orbitals - UEE, SOFT TISSUE, BRI, EYEBROW TILT, EYEBROW DENSITY, EYELASH DENSITY, SUPRAORBITAL PROJECTION
5. zygos - ZYGO HEIGHT, SUBMALAR HOLLOW INDEX, ZAP, FACIAL FAT, NASOLABIAL FOLDS, ZYGO SYMMETRY, ZYGO PROJECTION
6. harmony - FACIAL THIRDS, FWHR, TFWHR, BIGONIAL WIDTH, MWNWR, NECK-JAW WIDTH
7. nose - NFRA, NFA, NLA, TFC, NA, LLULR, MENTOLABIAL ANGLE
8. hair - HAIRLINE, HAIR VOLUME, TEMPLES, OPTIMAL HAIRCUT
9. ascension - Empty metrics (plan generated separately)
10. leanmax - Empty metrics (protocol generated separately)

Be precise with measurements. Score each metric 0-10 honestly based on PSL aesthetics standards.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require a valid session (anonymous sessions accepted, only blocks external abuse)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { photo } = await req.json();

    if (!photo) {
      return new Response(JSON.stringify({ error: "No photo provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 16000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${photo}` },
              },
              {
                type: "text",
                text: "Analyze this face photo. Return the full JSON analysis with all categories, metrics, and PSL tier classification.",
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const analysis = JSON.parse(content);

    // Wrap into FullAnalysisResult shape
    const result = {
      pslResult: {
        psl_tier: analysis.psl_tier,
        potential_tier: analysis.potential_tier,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      categories: analysis.categories,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message ?? "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
