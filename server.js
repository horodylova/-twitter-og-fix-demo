const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');
require('dotenv').config();

let kv;
try {
  kv = require('@vercel/kv').kv;
} catch (error) {
  console.log('KV not available, using memory storage');
  kv = new Map();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    }
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

app.use(express.static('public'));
app.use(express.json());

app.post('/api/create-post', async (req, res) => {
  try {
    const generator = new StaticHTMLGenerator();
    const result = await generator.generateRandomPost();

    const postId = `${result.slug}-${result.username}-${result.imageId}`;

    try {
      if (kv instanceof Map) {
        kv.set(`post:${postId}`, result.html);
      } else {
        await kv.set(`post:${postId}`, result.html, { ex: 60 * 60 * 24 * 30 });
      }
    } catch (kvError) {
      console.warn('KV storage error:', kvError.message);
    }

    result.url = `${generator.baseUrl}/post/${postId}`;
    res.json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/post/:id', async (req, res) => {
  try {
    let html;
    try {
      if (kv instanceof Map) {
        html = kv.get(`post:${req.params.id}`);
      } else {
        html = await kv.get(`post:${req.params.id}`);
      }
    } catch (kvError) {
      console.warn('KV storage error:', kvError.message);
      html = null;
    }
    
    if (!html) {
      const generator = new StaticHTMLGenerator();
      const fallbackResult = await generator.generateRandomPost();
      html = fallbackResult.html;
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('X-Robots-Tag', 'index, follow');
    res.send(html);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Error loading post');
  }
});

app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🐦 Twitter Card Demo</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            button { background: #1da1f2; color: white; border: none; padding: 15px 30px; border-radius: 50px; font-size: 16px; cursor: pointer; margin: 10px; }
            button:hover { background: #0d8bd9; }
            .result { margin-top: 20px; padding: 15px; border-radius: 10px; display: none; }
            .success { background: #d4edda; color: #155724; }
            .error { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🐦 Twitter Card Demo</h1>
            <p>Create a page with your image for Twitter sharing</p>
            <button onclick="createPage()">Create Page</button>
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

                        const data = await response.json();
                        
                        if (response.ok && data.url) {
                            resultDiv.className = 'result success';
                            resultDiv.innerHTML = \`
                                ✅ Page created successfully!<br>
                                <a href="\${data.url}" target="_blank">View Page</a> | 
                                <a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(data.url)}" target="_blank">Share on Twitter</a>
                            \`;
                        } else {
                            throw new Error(data.error || 'Failed to create page');
                        }
                    } catch (error) {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = '❌ Error: ' + error.message;
                    }
                }
            </script>
        </div>
    </body>
    </html>
  `);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

module.exports = app;
