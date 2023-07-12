const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoints will be defined here

const port = 3000; // choose any port you prefer

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// GET endpoint
app.get('/api/merchant', (req, res) => {
  
    const label = 'Abraham Maleko (The Developer)';
    const icon = 'https://github.com/abramaleko/solana-backend/blob/main/icon.png?raw=true';
  
    res.status(200).json({
      label,
      icon,
    });
});
