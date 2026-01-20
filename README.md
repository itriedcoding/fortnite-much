# FortniteGenius - Pro AI Thumbnail Studio 🚀

Top-tier AI Thumbnail generator designed specifically for Fortnite creators. Built with React, Tailwind CSS, and Google Gemini 2.5 (Flash & Pro).

![FortniteGenius Banner](https://img.shields.io/badge/Status-Operational-green?style=for-the-badge) ![Version](https://img.shields.io/badge/Version-2.5-purple?style=for-the-badge)

## ⚡ Features

*   **Studio Quality Renders**: Generates 8K-style thumbnails using Unreal Engine 5.5 aesthetics.
*   **Skin Lab**: Granular control over character appearance (Base model, style, colors, accessories).
*   **Live Item Shop**: Real-time sync with Fortnite servers for daily shop rotations.
*   **Player Stats**: "Holo-Locker" operator mode to view stats with your favorite skin.
*   **Meta Presets**: One-click setups for "Viral", "Competitive", or "Horror" video styles.

## 🚀 Deploy to Vercel

Deploy your own instance of FortniteGenius for free on Vercel. You will need a Google Gemini API Key.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgoogle-gemini%2Ffortnite-genius-demo&env=API_KEY&project-name=fortnite-genius&repository-name=fortnite-genius)

**Environment Variables Required:**
*   `API_KEY`: Your Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

## 🛠️ Local Development

1.  **Clone the project**
2.  **Create a `.env` file** in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key
    ```
3.  **Serve the app**:
    Since this project uses ES Modules directly in the browser (no build step required for dev), you can use any static file server.
    ```bash
    npx serve .
    ```

## 📦 Tech Stack

*   **Frontend**: React 19 (via ESM), Tailwind CSS
*   **AI Engine**: Google Gemini 2.5 Flash & Pro via `@google/genai`
*   **Data Sources**: Fortnite-API.com & FortniteAPI.io

---
*Note: This project is a fan creation and is not affiliated with Epic Games.*
