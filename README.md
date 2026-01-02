# AI Scraper API 🤖

A lightweight Node.js API that uses Puppeteer to scrape answers from Perplexity AI without requiring a login. It's designed to be used as a backend service for simple web applications.

## Features
- **Headless automation**: Runs in the background using Puppeteer.
- **Stealth mode**: Uses `puppeteer-extra-plugin-stealth` to avoid bot detection.
- **Optimized**: Blocks images and unnecessary resources for faster response times.
- **CORS enabled**: Ready to be called from any frontend.

## Installation

0. **Requirements**
    - Node.js (v16 or higher)
    - Chrome/Chromium (Puppeteer will download it automatically)

1. **Clone the repository:**
   git clone https://github.com/fra0902/Ai_Scraper_API.git
   cd Ai_Scraper_API

2. **Install dependencies**
    npm install

3. **Configuration**
    The project is set to run on http://localhost:3000. You can change the port in server.js

## API Endpoint

- **POST /ask**
    *Request Body*
        {
            "question": "Your question here..."
        }

    *Response*
        {
            "success": true,
            "answer": "The response text from the AI..."
        }
