# StyleForge Backend

Backend API for StyleForge - A CSS theme builder application.

## Features

- Theme management (CRUD operations)
- Section management for themes
- Website proxy service for extracting HTML/CSS
- CSS generation and export
- MongoDB database integration

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Cheerio (HTML parsing)
- Axios (HTTP requests)

## Environment Variables

Create a `.env` file with:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

## Deployment on Vercel

1. Push this repository to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
