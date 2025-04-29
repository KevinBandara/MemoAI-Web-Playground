const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: DiscordStrategy } = require('passport-discord');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');
const User = require('./user.js').default;

const Premium = require('./premium.js').premium;
const https = require('https');
const fs = require('fs');



dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const PORT = process.env.PORT || 25561;




// https.createServer(options, app).listen(PORT, () => {
    //console.log(`Secure server running on https://playground.witheredmc.xyz`);
//});


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static('./'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
app.get('/auth/logout', (req, res) => { req.logout(() => res.redirect('/index.html?logout=1')); });
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: { id: req.user.id, username: req.user.username } });
  } else {
    res.json({ authenticated: false });
  }
});

const dbPromise = open({
  filename: 'database.db',
  driver: sqlite3.Database
});

async function initializeDb() {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      userId TEXT,
      model TEXT,
      title TEXT,
      messages TEXT
    )
  `);
}
initializeDb();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized - Please log in with Discord.' });
}

function getSystemPrompt() {
  return [
    {
      role: "system",
      content: `
      You are a chat model presented by the MemoAI project. If someone asks who you are, tell them that you are a chat model presented by MemoAI project developed by Licoryx Technologies.
      You were founded on May 4th of 2023.
      You are hosted on Techstar Host.
      You are powered by ElectronAI Company as an official partner of Licoryx Technologies.
      Your Discord server link is https://discord.gg/uRRZtA5Mmf.
      If someone asks how to buy premium or wishes to buy premium, provide them the Discord server link and ask them to open a ticket.
      Your responses should be clear, helpful, and focused on the user's queries, avoiding any unnecessary verbosity.
      Always prioritize the user's needs and ensure that your interactions are engaging and informative.
      Do not repeat previous answers unless asked by the user. Reply with only the answer regarding what the user asked.
      You are strictly prohibited from using racist or inappropriate words in your responses.
      `
    }
  ];
}

function filterConversationForClient(conversation) {
  const filtered = { ...conversation };
  if (Array.isArray(filtered.messages)) {
    filtered.messages = filtered.messages.filter(msg => msg.role !== 'system');
  }
  return filtered;
}

app.post('/api/chat', ensureAuthenticated, async (req, res) => {
  const { message, model, conversationId } = req.body;
  if (!message || !model) return res.status(400).json({ error: 'Message and model are required.' });
  try {
    const db = await dbPromise;
    let conversation;
    let userRecord = await User.findOne({ userID: req.user.id });
    if (!userRecord) {
      userRecord = await Premium.userCreate(req.user.id);
    }
    const isPremium = await Premium.checkPE(userRecord, { user: req.user });
    if (!isPremium) {
      return res.status(403).json({ error: 'You are not premium. Please join our Discord server: https://discord.gg/uRRZtA5Mmf' });
    }
    if (conversationId) {
      conversation = await db.get('SELECT * FROM conversations WHERE id = ? AND userId = ?', [conversationId, req.user.id]);
      if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
      conversation.messages = JSON.parse(conversation.messages);
    } else {
      const timestamp = new Date().toLocaleString();
      conversation = {
        id: nanoid(),
        userId: req.user.id,
        model,
        title: timestamp,
        messages: getSystemPrompt()
      };
      await db.run('INSERT INTO conversations (id, userId, model, title, messages) VALUES (?, ?, ?, ?, ?)',
        [conversation.id, conversation.userId, conversation.model, conversation.title, JSON.stringify(conversation.messages)]);
    }
    conversation.messages.push({ role: 'user', content: message });
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.electronhub.top/v1"
    });
    const response = await openai.chat.completions.create(
      {
      model,
      messages: conversation.messages,
      options: {
        web_search: false
      },
      max_tokens: 4000
    });
    























































    
    
    if (!model) {
      return res.status(400).json({ error: 'No model selected.' });
    }
    if (!Array.isArray(conversation.messages) || conversation.messages.length === 0) {
      return res.status(400).json({ error: 'Conversation has no messages.' });
    }
    console.log('Sending to OpenAI:', { model, messages: conversation.messages });
    const reply = response.choices[0].message.content;
    conversation.messages.push({ role: 'assistant', content: reply });
    await db.run('UPDATE conversations SET messages = ? WHERE id = ?', [JSON.stringify(conversation.messages), conversation.id]);
    const convForClient = filterConversationForClient(conversation);
    res.json({ conversationId: conversation.id, reply, conversation: convForClient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating response.' }, model, message);
  }
});

app.put('/api/conversations/:id', ensureAuthenticated, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  try {
    const db = await dbPromise;
    const conversation = await db.get('SELECT * FROM conversations WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    await db.run('UPDATE conversations SET title = ? WHERE id = ?', [title, req.params.id]);
    const updatedConversation = await db.get('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    updatedConversation.messages = JSON.parse(updatedConversation.messages);
    res.json({ conversation: updatedConversation });
  } catch (error) {
    console.error("Error renaming conversation:", error);
    res.status(500).json({ error: 'Failed to rename conversation.' });
  }
});

app.delete('/api/conversations/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await dbPromise;
    const conversation = await db.get('SELECT * FROM conversations WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });
    await db.run('DELETE FROM conversations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

app.delete('/api/conversations', ensureAuthenticated, async (req, res) => {
  try {
    const db = await dbPromise;
    await db.run('DELETE FROM conversations WHERE userId = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing conversations:", error);
    res.status(500).json({ error: 'Failed to clear conversations.' });
  }
});

app.get('/api/conversations', ensureAuthenticated, async (req, res) => {
  try {
    const db = await dbPromise;
    const conversations = await db.all('SELECT * FROM conversations WHERE userId = ?', [req.user.id]);
    conversations.forEach(conv => {
      conv.messages = JSON.parse(conv.messages);
    });
    const filtered = conversations.map(filterConversationForClient);
    res.json(filtered);
  } catch (error) {
    console.error("Error loading conversations:", error);
    res.status(500).json({ error: 'Failed to load conversations.' });
  }
});

app.get('/api/conversations/:id', ensureAuthenticated, async (req, res) => {
  try {
    const db = await dbPromise;
    const conversation = await db.get('SELECT * FROM conversations WHERE id = ? AND userId = ?', [req.params.id, req.user.id]);
    if (conversation) {
      conversation.messages = JSON.parse(conversation.messages);
      const filtered = filterConversationForClient(conversation);
      res.json(filtered);
    } else {
      res.status(404).json({ error: 'Conversation not found.' });
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
    res.status(500).json({ error: 'Failed to load conversation.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
