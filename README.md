# MemoAI Web Playground

An interactive web sandbox, multi-modal interface, and configuration portal built for the **MemoAI** platform. The dashboard integrates Discord OAuth2 authentication, multi-modal prompt experimentation (VisionLab), OpenAI API model interactions, and MongoDB persistence.

---

## Key Features

- **Discord OAuth2 Authentication:** Secure session management restricting dashboard access exclusively to authenticated Discord accounts.
- **Interactive AI Playground:** Real-time conversational interface designed for testing prompt templates, context windows, and streaming outputs using OpenAI APIs.
- **VisionLab Suite:** Dedicated multi-modal testing workbench supporting image and visual data processing workflows.
- **Access Control & Entitlements:** Built-in membership tiers, premium token redemptions, and user-level quota enforcement.
- **Dual Layer Persistence:** High-performance database storage with MongoDB and schemas for user states, configurations, and tokens.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose / MongoDB Driver), SQLite3
- **AI Integration:** OpenAI API
- **Authentication:** Discord OAuth2 API & Session Middleware
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, Custom Modular CSS

---

## Project Structure

├── schemas/          # MongoDB / data schema definitions and helpers
├── index.html        # Landing page and navigation portal
├── login.css         # Authentication gateway styling
├── playground.html   # Core interactive model playground
├── visionlab.html    # Multi-modal / image processing test lab
├── user.js           # Account state and user preference handler
├── premium.js        # License keys and token tier manager
├── server.js         # Express server, Discord OAuth2 routes, and API endpoints
└── database.db       # Local runtime storage

---

## Getting Started

### Prerequisites

- Node.js (v16.0 or higher)
- npm
- MongoDB instance (local or MongoDB Atlas)
- Discord Developer Application (Client ID & Client Secret)
- OpenAI API Key

### Installation

1. Clone the repository:
   git clone https://github.com/KevinBandara/MemoAI-Web-Playground.git
   cd MemoAI-Web-Playground

2. Install dependencies:
   npm install

3. Configure environment variables:
   Create a .env file in the root directory:
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_CALLBACK_URL=http://localhost:25561/auth/discord/callback
   OPENAI_API_KEY=your_openai_api_key
   MONGODB_URI=your_mongodb_connection_string
   PORT=25561

4. Run the server:
   node server.js

5. Access the playground:
   Open your browser and navigate to http://localhost:25561
