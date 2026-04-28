require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voting-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  description: { type: String },
  votes: { type: Number, default: 0 }
});
const Candidate = mongoose.model('Candidate', candidateSchema);

// Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Auth Error' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Invalid Token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, username: user.username, hasVoted: user.hasVoted });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vote', auth, async (req, res) => {
  try {
    const { candidateId } = req.body;
    const user = await User.findById(req.userId);
    if (user.hasVoted) return res.status(400).json({ message: 'User has already voted' });
    
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
    user.hasVoted = true;
    await user.save();
    
    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Chatbot integration (Gemini API)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake-key');
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ response: "AI Assistant is currently running in mock mode. I recommend looking at candidates' platform and track record before voting." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `You are a helpful AI Voting Assistant. The user is asking: "${message}". Please provide unbiased, helpful information about the voting process. Do not recommend a specific real-world candidate, but help them understand how to evaluate choices. Keep your answer under 100 words.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Chat error' });
  }
});

// Admin route to seed candidates
app.post('/api/admin/seed', async (req, res) => {
  try {
    const count = await Candidate.countDocuments();
    if (count === 0) {
      await Candidate.insertMany([
        { name: 'Jane Doe', party: 'Progressive Party', description: 'Focused on education, healthcare reform, and clean energy.' },
        { name: 'John Smith', party: 'Conservative Party', description: 'Focused on lower taxes, business growth, and national security.' },
        { name: 'Alice Johnson', party: 'Independent', description: 'Focused on government transparency, infrastructure, and bipartisan solutions.' }
      ]);
      res.json({ message: 'Candidates seeded successfully' });
    } else {
      res.json({ message: 'Candidates already exist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
