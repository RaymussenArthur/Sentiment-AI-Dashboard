# Sentiment AI Dashboard

A powerful, AI-driven customer feedback analysis tool built with Next.js and the Gemini API. 

## 📸 UI Preview

<div align="center">
  <img src="https://github.com/RaymussenArthur/Sentiment-AI-Dashboard/blob/main/Screenshot%202026-03-14%20150024.png" alt="Dashboard Main View" width="800" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
  <p><em>Input review page with option to add raw synthetic review data for testing.</em></p>
</div>

<div align="center">
  <img src="https://github.com/RaymussenArthur/Sentiment-AI-Dashboard/blob/main/Screenshot%202026-03-14%20150333.png" alt="Dashboard Main View" width="800" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
</div>

<div align="center">
  <img src="https://github.com/RaymussenArthur/Sentiment-AI-Dashboard/blob/main/Screenshot%202026-03-14%20150342.png" alt="AI Chatbot View" width="800" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
  <p><em>The main dashboard interface with sentiment trends and word clouds.</em></p>
</div>

## 🚀 Features

* **Instant Analysis:** Paste raw customer reviews (text, chat logs, etc.) and get an instant breakdown.
* **Executive Summary:** AI-generated top 3 actionable areas for improvement.
* **Sentiment Trend:** Visual line chart tracking customer sentiment over time.
* **Frequent Themes Word Cloud:** Visual representation of the most common praises (green) and complaints (red).
* **Interactive AI Chatbot:** Ask complex questions about your data using Gemini 3.1 Pro's advanced reasoning capabilities.
* **Sample Data Loading:** Quickly test the dashboard with pre-loaded realistic review data.
* **Export Ready:** Print-friendly layout for easy PDF exporting.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Styling:** Tailwind CSS
* **Charts:** Recharts & D3.js
* **AI:** Google Gen AI SDK (`gemini-3.1-pro-preview`)
* **Icons:** Lucide React

## 📦 Getting Started

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
