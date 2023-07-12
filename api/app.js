const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API endpoints will be defined here

const port = 3000; // choose any port you prefer

app.listen(port, () => {
  res.send("Express on Vercel");
  console.log(`Server running on port ${port}`);
});

// GET endpoint
app.get('/api/merchant-info', (req, res) => {
  
    const label = 'Abraham Maleko (The Developer)';
    const icon = 'https://exiledapes.academy/wp-content/uploads/2021/09/X_share.png';
  
    res.status(200).json({
      label,
      icon,
    });
});

// Export the Express API
module.exports = app.js;
