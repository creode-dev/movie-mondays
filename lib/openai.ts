import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMovieRecommendations(userQuery: string, streamingServices: string[]): Promise<Array<{ title: string; year?: number; reason: string }>> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  try {
    const servicesText = streamingServices.length > 0 ? ` available on ${streamingServices.join(', ')} in the UK` : '';
    const prompt = `User query: "${userQuery}"

Generate 20–24 thoughtful movie recommendations${servicesText}.

Prioritize these goals:
	1.	Arthouse, international, and distinctive films (about 60–70% of the list) — emphasize works known for strong artistic vision, innovative storytelling, or cultural significance.
	2.	Hidden gems and critically acclaimed but underappreciated titles — highlight films that deserve more attention or acclaim.
	3.	Include a few well-chosen mainstream or popular films that still align with the user's tastes, to ensure variety and accessibility.
	4.	Match any specific criteria the user mentions (actors, directors, genres, themes, ratings, runtime, language, etc.).
	5.	Maintain diversity — mix of genres, countries, and eras.

Output format:
Return only a valid JSON array of objects in this exact structure (no markdown, no extra text):

[
{
"title": "Movie Title",
"year": 2020,
"reason": "A single, specific sentence explaining why this film fits the user's interests — highlight what makes it special (themes, tone, performances, cinematography, or storytelling style) without spoilers."
}
]`;

    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000, // Increased for 24 recommendations
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


