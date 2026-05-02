require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/', (req, res) => res.send('Backend is running!'));
app.get('/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState }));

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'approved' },
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

const electionSchema = new mongoose.Schema({
  status: { type: String, enum: ['not_started', 'active', 'ended'], default: 'not_started' }
});
const Election = mongoose.model('Election', electionSchema);

// MongoDB Connection (Use Memory Server for testing)
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;
async function connectDB() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('MongoDB Memory Server connected:', uri);
    
    // Seed initial data
    await Candidate.insertMany([
      { name: 'Jane Doe', party: 'Progressive Party', description: 'Focused on education, healthcare reform, and clean energy.' },
      { name: 'John Smith', party: 'Conservative Party', description: 'Focused on lower taxes, business growth, and national security.' },
      { name: 'Alice Johnson', party: 'Independent', description: 'Focused on government transparency, infrastructure, and bipartisan solutions.' }
    ]);
    
    await Election.create({ status: 'not_started' });
    
    // Seed an admin user for testing
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedAdminPassword, role: 'admin' });
    
    console.log('Seeded candidates, election config, and default admin (admin/admin123) for testing.');
  } catch (err) {
    console.error('MongoDB Memory Server connection error:', err);
  }
}
connectDB();

// Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Auth Error' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    res.status(500).json({ message: 'Invalid Token' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// Routes - Authentication
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
  console.log('Login attempt:', req.body.username, 'Role:', req.body.expectedRole);
  try {
    const { username, password, expectedRole } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (user.status === 'blocked') {
      console.log('Login failed: User blocked');
      return res.status(403).json({ message: 'Your account is blocked.' });
    }
    
    if (expectedRole && user.role !== expectedRole) {
      console.log(`Login failed: Role mismatch (expected ${expectedRole}, got ${user.role})`);
      return res.status(403).json({ message: `Access denied. You are not an ${expectedRole}.` });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    console.log('Login successful for:', username);
    res.json({ token, username: user.username, role: user.role, hasVoted: user.hasVoted, status: user.status });
  } catch (error) {
    console.error('CRITICAL LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// General Routes
app.get('/api/election-status', async (req, res) => {
  try {
    const election = await Election.findOne();
    res.json({ status: election.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates.map(c => ({ _id: c._id, name: c.name, party: c.party, description: c.description })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/results', auth, async (req, res) => {
  try {
    const election = await Election.findOne();
    if (req.userRole !== 'admin' && election.status !== 'ended') {
      return res.status(403).json({ message: 'Results are not available yet' });
    }
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vote', auth, async (req, res) => {
  try {
    const election = await Election.findOne();
    if (election.status !== 'active') return res.status(403).json({ message: 'Election is not active' });
    
    const user = await User.findById(req.userId);
    if (user.hasVoted) return res.status(403).json({ message: 'You have already voted' });
    
    const { candidateId } = req.body;
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
    await User.findByIdAndUpdate(req.userId, { hasVoted: true });
    
    res.json({ message: 'Vote cast successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes
app.get('/api/admin/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalVotes = await Candidate.aggregate([{ $group: { _id: null, total: { $sum: "$votes" } } }]);
    const candidates = await Candidate.find();
    const election = await Election.findOne();
    
    res.json({
      totalVoters,
      totalVotes: totalVotes[0]?.total || 0,
      candidates: candidates.length,
      electionStatus: election.status
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/voters', auth, adminAuth, async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password');
    res.json(voters);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/voters/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/candidates', auth, adminAuth, async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/candidates/:id', auth, adminAuth, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/election/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await Election.findOneAndUpdate({}, { status });
    res.json({ message: 'Election status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Chatbot route
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ response: "I'm a local voting assistant. Please configure the Gemini API key in the backend to enable AI responses." });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`You are an AI Voting Assistant for a digital election system. Answer the following question briefly and helpfully: ${message}`);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    res.status(500).json({ response: "I'm having trouble thinking right now. Please try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
