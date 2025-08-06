const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');
const { kv } = require('@vercel/kv'); // Устанавливаем пакет: npm i @vercel/kv
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Static images
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    }
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.use(express.static('public'));
app.use(express.json());

// Создание поста и сохранение HTML в KV
app.post('/api/create-post', async (req, res) => {
  try {
    const generator = new StaticHTMLGenerator();
    const result = await generator.generateRandomPost();

    const postId = `${result.slug}-${result.username}-${result.imageId}`;

    // Сохраняем с TTL (например, 30 дней)
    await kv.set(`post:${postId}`, result.html, { ex: 60 * 60 * 24 * 30 });

    result.url = `${generator.baseUrl}/post/${postId}`;
    res.json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Отдача статичного HTML из KV
app.get('/post/:id', async (req, res) => {
  try {
    const html = await kv.get(`post:${req.params.id}`);
    if (!html) {
      return res.status(404).send('Post not found');
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(html);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Error loading post');
  }
});

// Главная страница
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

                        if (response.ok) {
                            const data = await response.json();
                            resultDiv.className = 'result success';
                            resultDiv.innerHTML = \`
                                ✅ Page created successfully!<br>
                                <a href="\${data.url}" target="_blank">View Page</a> | 
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
