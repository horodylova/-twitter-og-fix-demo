const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const generator = new StaticHTMLGenerator();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static('public'));
app.use('/static-pages', express.static(path.join(__dirname, 'public/static-pages')));

app.get('/post', (req, res) => {
  const staticFile = path.join(__dirname, 'public/static-pages/post.html');
  
  res.sendFile(staticFile, (err) => {
    if (err) {
      res.send(`
        <h1>Page Not Found</h1>
        <p>Create the page first:</p>
        <a href="/">Create Page</a>
      `);
    }
  });
});

app.post('/api/create-post', async (req, res) => {
  try {
    const result = await generator.generatePost();
    
    res.json({
      success: true,
      url: result.url,
      message: 'Page created successfully!'
    });
    
  } catch (error) {
    console.error('Page creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Twitter OG Demo</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 500px; 
          margin: 50px auto; 
          padding: 20px;
          text-align: center;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 30px; }
        .create-btn { 
          background: #1da1f2; 
          color: white; 
          padding: 15px 30px; 
          border: none; 
          border-radius: 25px; 
          font-size: 16px; 
          font-weight: bold;
          cursor: pointer; 
          margin: 20px 0;
        }
        .create-btn:hover { background: #0d8bd9; }
        .create-btn:disabled { background: #ccc; cursor: not-allowed; }
        .result { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .twitter-btn {
          background: #1da1f2;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 20px;
          margin: 10px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐦 Twitter Card Demo</h1>
        <p>Create a page with your image for Twitter sharing</p>
        
        <button onclick="createPost()" id="createBtn" class="create-btn">
          Create Page
        </button>
        
        <div id="result"></div>
      </div>
      
      <script>
        async function createPost() {
          const btn = document.getElementById('createBtn');
          btn.disabled = true;
          btn.textContent = 'Creating...';
          
          try {
            const response = await fetch('/api/create-post', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
              document.getElementById('result').innerHTML = \`
                <div class="result success">
                  <h3>✅ Page Created!</h3>
                  <p><a href="\${data.url}" target="_blank">View Page</a></p>
                  <a href="https://twitter.com/intent/tweet?text=\${encodeURIComponent('Check out this amazing offer!')}&url=\${encodeURIComponent(data.url)}" target="_blank" class="twitter-btn">
                    🐦 Share on Twitter
                  </a>
                </div>
              \`;
            } else {
              throw new Error(data.error);
            }
          } catch (error) {
            document.getElementById('result').innerHTML = \`
              <div class="result error">
                <h3>❌ Error</h3>
                <p>\${error.message}</p>
              </div>
            \`;
          } finally {
            btn.disabled = false;
            btn.textContent = 'Create Page';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});