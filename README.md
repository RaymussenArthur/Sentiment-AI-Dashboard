# Sentiment AI Dashboard

A powerful, AI-driven customer feedback analysis tool built with Next.js and the Gemini API. 

## 📸 UI Preview

*(Note: Replace these placeholder paths with actual screenshots of your app once you clone the repo!)*

<div align="center">
  <img src="https://picsum.photos/seed/dashboard-main/800/450?blur=2" alt="Dashboard Main View" width="800" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
  <p><em>The main dashboard interface with sentiment trends and word clouds.</em></p>
</div>

<div align="center">
  <img src="https://picsum.photos/seed/dashboard-chat/800/450?blur=2" alt="AI Chatbot View" width="800" style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
  <p><em>The interactive AI chatbot analyzing the reviews in real-time.</em></p>
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

## 🗺️ Roadmap / Future Enhancements

Here are some features that would be great additions to this dashboard:
* **CSV/Excel Upload:** Allow users to upload structured files instead of just pasting text.
* **Multi-Language Support:** Automatically translate and analyze reviews in different languages.
* **Historical Comparisons:** Compare current sentiment trends with previous quarters.
* **Automated Email Reports:** Schedule weekly or monthly sentiment summaries.
* **Authentication & Saving:** Let users create accounts to save their reports and historical data.
* **Detailed Review Breakdown:** A table showing the original reviews alongside their individual AI-assigned sentiment scores.
