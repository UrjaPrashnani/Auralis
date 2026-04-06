# Auralis Deployment on Vercel

This application is ready to be deployed on Vercel.

## Deployment Steps

1.  **Push to GitHub**: Push this repository to a GitHub, GitLab, or Bitbucket account.
2.  **Import to Vercel**:
    *   Log in to [Vercel](https://vercel.com).
    *   Click "Add New" -> "Project".
    *   Import your repository.
3.  **Configure Environment Variables**:
    *   In the "Environment Variables" section during setup, add:
        *   `GEMINI_API_KEY`: Your Google Gemini API Key.
4.  **Deploy**: Click "Deploy".

## Project Structure

*   `src/`: React source code.
*   `vite.config.ts`: Vite configuration, including environment variable mapping.
*   `vercel.json`: Vercel configuration for SPA routing.

## Local Development

```bash
npm install
npm run dev
```
