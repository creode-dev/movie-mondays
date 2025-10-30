# Movie Mondays

Intelligent movie recommendations filtered by your UK streaming services.

## Setup

1. Create a `.env.local` with:

```
TMDB_API_KEY=your_tmdb_bearer_token
OMDB_API_KEY=your_omdb_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Notes:
- TMDB expects a Bearer token (v4 auth). Copy the "API Read Access Token (v4 auth)" from TMDB settings.
- Get your Anthropic API key from https://console.anthropic.com/

2. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

This app works perfectly on Vercel! 

### Quick Deploy

1. **Push your code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Add Environment Variables:**
   In the Vercel project settings, add these environment variables:
   - `TMDB_API_KEY` - Your TMDB v4 Read Access Token
   - `OMDB_API_KEY` - Your OMDB API key  
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

4. **Deploy!**
   - Click "Deploy"
   - Vercel will automatically build and deploy your Next.js app

### Manual Deploy via CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add environment variables when asked.

## Docker

```bash
docker build -t movie-mondays .
# Example run (mount env):
docker run -p 3000:3000 --env-file .env.local movie-mondays
```


