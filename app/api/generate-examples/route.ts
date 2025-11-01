import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const runtime = 'nodejs';

/**
 * Generate fresh example search terms using AI
 * Returns one item from each category: director, actor, genre, theme
 */
export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 500 }
    );
  }

  try {
    const prompt = `Generate fresh, varied movie search examples. Return ONLY a JSON object with these exact keys (no markdown, no extra text):

{
  "director": "one obscure or interesting director name (e.g., 'Apichatpong Weerasethakul', 'Lucrecia Martel', 'Céline Sciamma')",
  "actor": "one obscure or interesting actor name (e.g., 'Tilda Swinton', 'Willem Dafoe', 'Isabelle Huppert')",
  "genre": "one arthouse or niche genre term (e.g., 'slow cinema', 'experimental films', 'postmodern cinema', 'contemporary world cinema')",
  "theme": "one interesting movie theme (e.g., 'existentialism', 'memory and time', 'urban alienation', 'moral ambiguity')",
  "ratingFilter": "one rating filter phrase (e.g., 'rating over 7 on IMDB', 'IMDB rating over 7.5', 'highly rated')",
  "runtimeFilter": "one runtime filter phrase (e.g., 'running time less than 2 hours', 'movies under 90 minutes', 'films under 100 minutes')"
}

Make each suggestion:
- Different from common/mainstream choices
- Culturally diverse (international directors/actors)
- Varied each time (don't repeat the same examples)
- Appropriate for arthouse/indie film enthusiasts
- Real and recognizable (not made-up names)

Return only valid JSON, no explanation.`;

    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      system: "You are a movie recommendation expert. Always return valid JSON only, no markdown, no extra text.",
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
    if (!text) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    try {
      const examples = JSON.parse(jsonText);
      
      // Validate structure
      if (!examples.director || !examples.actor || !examples.genre || !examples.theme || !examples.ratingFilter || !examples.runtimeFilter) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json(examples);
    } catch (e) {
      console.error('Failed to parse AI examples:', e, 'Response:', text);
      // Fallback to default examples
      return NextResponse.json({
        director: "Akira Kurosawa",
        actor: "Tilda Swinton",
        genre: "slow cinema",
        theme: "existentialism",
        ratingFilter: "rating over 7 on IMDB",
        runtimeFilter: "running time less than 2 hours"
      });
    }
  } catch (error) {
    console.error('Failed to generate AI examples:', error);
    // Fallback to default examples
    return NextResponse.json({
      director: "Akira Kurosawa",
      actor: "Tilda Swinton",
      genre: "slow cinema",
      theme: "existentialism",
      ratingFilter: "rating over 7 on IMDB",
      runtimeFilter: "running time less than 2 hours"
    });
  }
}

