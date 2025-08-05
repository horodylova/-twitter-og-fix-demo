const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.removeHeader('X-Powered-By');
  next();
});


app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1d', 
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    }
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.use(express.static('public'));
app.use(express.json());

app.get('/post', async (req, res) => {
  try {
    const generator = new StaticHTMLGenerator();
    const result = await generator.generatePost();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); 
    
    res.send(result.html);
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).send('Error generating page');
  }
});

app.post('/api/create-post', async (req, res) => {
  try {
    const generator = new StaticHTMLGenerator();
    const result = await generator.generatePost();
    res.json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/test-image', (req, res) => {
  const baseUrl = process.env.BASE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  `http://localhost:${PORT}`;
  const imageUrl = `${baseUrl}/images/1.png`;
  
  res.json({
    imageUrl,
    timestamp: new Date().toISOString(),
    message: 'Test this URL directly in browser'
  });
});

app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  `http://localhost:${PORT}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🐦 Twitter Card Demo</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                text-align: center;
            }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            button {
                background: #1da1f2;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
            }
            button:hover { background: #0d8bd9; }
            .result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 10px;
                display: none;
            }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
            .debug {
                background: #e2e3e5;
                color: #383d41;
                text-align: left;
                font-family: monospace;
                font-size: 12px;
                white-space: pre-wrap;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🐦 Twitter Card Demo</h1>
            <p>Create a page with your image for Twitter sharing</p>
            
            <button onclick="createPage()">Create Page</button>
            <button onclick="testImage()">Test Image URL</button>
            
            <div id="result" class="result"></div>
            
            <script>
                async function createPage() {
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = 'Creating page...';
                    
                    try {
                        const response = await fetch('/api/create-post', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            resultDiv.className = 'result success';
                            resultDiv.innerHTML = \`
                                ✅ Page created successfully!<br>
                                <a href="\${data.url}" target="_blank">View Page</a> | 
                                <a href="https://cards-dev.twitter.com/validator" target="_blank">Test in Twitter Validator</a><br>
                                <a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(data.url)}" target="_blank">Share on Twitter</a>
                            \`;
                        } else {
                            throw new Error('Failed to create page');
                        }
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error: ' + error.message;
                    }
                }
                
                async function testImage() {
                    const resultDiv = document.getElementById('result');
                    resultDiv.style.display = 'block';
                    resultDiv.className = 'result';
                    resultDiv.innerHTML = 'Testing image...';
                    
                    try {
                        const response = await fetch('/test-image');
                        const data = await response.json();
                        
                        resultDiv.className = 'result debug';
                        resultDiv.innerHTML = \`Image URL: \${data.imageUrl}
Time: \${data.timestamp}

Test this URL directly in your browser:
<a href="\${data.imageUrl}" target="_blank">\${data.imageUrl}</a>\`;
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error testing image: ' + error.message;
                    }
                }
            </script>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});