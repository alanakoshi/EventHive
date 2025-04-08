// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const authMiddleware = require('./middleware/authMiddleware');

app.use(express.json());
app.use(cors());

// Example protected route:
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route!', user: req.user });
});

// Import and mount other routes here...
// const eventRoutes = require('./routes/eventRoutes');
// app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
