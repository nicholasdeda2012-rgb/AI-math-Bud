# AI Math Bud

A web-based application that tutors middle to high school math students using AI-powered image recognition and step-by-step problem solving.

## Features

- 📸 Upload images or take photos of math problems
- 🤖 AI-powered problem analysis using OpenAI Vision API
- 📚 Step-by-step educational solutions
- 🎯 Student-friendly interface designed for learning
- 📱 Responsive design for desktop and mobile

## Quick Start

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
cp server/.env.example server/.env
# Add your OpenAI API key to server/.env
```

3. Start the development servers:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Frontend**: React, HTML5 Camera API, CSS3
- **Backend**: Express.js, Node.js
- **AI**: OpenAI Vision API
- **File Upload**: Multer middleware

## Environment Setup

Create a `server/.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

## Project Structure

```
ai-math-bud/
├── client/          # React frontend
├── server/          # Express.js backend
├── package.json     # Root package.json
└── README.md        # This file
```
