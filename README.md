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

Deploy your own instance of FortniteGenius for free on Vercel.

1.  Push this code to your own GitHub, GitLab, or Bitbucket repository.
2.  Click the button below to import your project into Vercel.
3.  Add your `API_KEY` when prompted during the deployment (Environment Variables).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Environment Variables Required:**
*   `API_KEY`: Your Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

## 🛠️ Local Development

1.  **Clone the project**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key
    ```
4.  **Start the dev server**:
    ```bash
    npm run dev
    ```

## 📦 Tech Stack

*   **Frontend**: React 18, Tailwind CSS (CDN), Vite
*   **AI Engine**: Google Gemini 2.5 Flash & Pro via `@google/genai`
*   **Data Sources**: Fortnite-API.com & FortniteAPI.io

---
*Note: This project is a fan creation and is not affiliated with Epic Games.*
