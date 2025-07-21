// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const goalRoutes = require('./routes/goalRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');

const jwt = require('jsonwebtoken');
const Todo = require('./models/Todo'); // Import Todo model

dotenv.config();
const app = express();

app.use(cors({
  origin: ['https://leetcode-buddy-iota.vercel.app'],
  credentials: true
}));


app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// ✅ Test route to check backend
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});


app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/leetcode', leetcodeRoutes);


// To-Do List endpoints
app.get('/api/todos', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const todos = await Todo.find({ userId: new mongoose.Types.ObjectId(decoded.id) });
    res.json(todos);
  } catch (err) {
    console.error('Get todos error:', err);
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.body.description?.trim()) {
      return res.status(400).json({ message: 'Task description is required' });
    }
    const todo = new Todo({
      userId: new mongoose.Types.ObjectId(decoded.id),
      description: req.body.description.trim()
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error('Post todo error:', err);
    res.status(500).json({ message: err.message || 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: new mongoose.Types.ObjectId(decoded.id) },
      { completed: req.body.completed },
      { new: true }
    );
    if (!todo) return res.status(404).json({ message: 'Task not found' });
    res.json(todo);
  } catch (err) {
    console.error('Put todo error:', err);
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));