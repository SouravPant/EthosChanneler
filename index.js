const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Serve the index.html file
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } else {
    res.status(404).send('Not found');
  }
};