import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMovieRecommendations(userQuery: string, streamingServices: string[]): Promise<Array<{ title: string; year?: number; reason: string }>> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  try {
    const servicesText = streamingServices.length > 0 ? ` available on ${streamingServices.join(', ')} in the UK` : '';
    const prompt = `User query: "${userQuery}"

Generate 8-10 movie recommendations${servicesText}. Return ONLY a JSON array of objects with this exact structure:
[
  {"title": "Movie Title", "year": 2020, "reason": "One sentence explaining why the user might like this film based on their query"}
]

Requirements:
- Return ONLY valid JSON, no markdown, no explanations
- Match the user's preferences from their query (actors, directors, genres, themes, etc.)
- Include diverse recommendations
- Reasons should be specific and avoid spoilers
- If year is unknown, omit it`;

    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      system: "You are a movie recommendation expert. Always return valid JSON only.",
      messages: [
        { role: "user", content: prompt },
      ],
    });
    
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
    if (!text) return [];
    
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    
    try {
      const recommendations = JSON.parse(jsonText);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (e) {
      console.error('Failed to parse AI recommendations:', e, 'Response:', text);
      return [];
    }
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error);
    return [];
  }
}

export async function generateReason(userContext: string, movieTitle: string, movieOverview: string) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const prompt = `User context: ${userContext}\nMovie: ${movieTitle}\nOverview: ${movieOverview}\nExplain in one sentence why this user might like the movie. Avoid spoilers.`;
    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 60,
      system: "You are a concise movie recommender.",
      messages: [
        { role: "user", content: prompt },
      ],
    });
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
    return text || null;
  } catch (error) {
    console.error('Failed to generate AI reason:', error);
    return null;
  }
}


