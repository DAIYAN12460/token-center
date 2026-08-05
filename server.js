// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== API Routes =====

// Generate Token
app.get('/api/generate-token', (req, res) => {
    const chars = '0123456789abcdef';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars[Math.floor(Math.random() * 16)];
    }
    
    res.json({
        success: true,
        token: token,
        created: Date.now(),
        expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
    });
});

// Validate Token
app.get('/api/validate/:token', (req, res) => {
    const { token } = req.params;
    
    // Check in database or file
    // For demo, just validate length
    const isValid = token && token.length === 64;
    
    res.json({
        valid: isValid,
        token: token
    });
});

// Save Token (for tracking)
app.post('/api/save-token', (req, res) => {
    const { token, accountId, userId } = req.body;
    
    // Save to file (or database)
    const data = {
        token,
        accountId,
        userId,
        timestamp: Date.now()
    };
    
    // Append to log
    const logPath = path.join(__dirname, 'tokens.log');
    fs.appendFileSync(logPath, JSON.stringify(data) + '\n');
    
    res.json({
        success: true,
        message: 'Token saved'
    });
});

// Get Stats
app.get('/api/stats', (req, res) => {
    const logPath = path.join(__dirname, 'tokens.log');
    
    if (!fs.existsSync(logPath)) {
        return res.json({ total: 0 });
    }
    
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line);
    
    res.json({
        total: lines.length,
        last: lines.length > 0 ? JSON.parse(lines[lines.length - 1]) : null
    });
});

// ===== Serve HTML =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});