// server.js  (логика как у тебя; добавлены только заголовки кэша для бота и sitemap)
require('dotenv').config();
const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');

const app = express();
const PORT = process.env.PORT || 3000;

// --- helpers
function isTwitterBot(userAgent = '') {
  return /twitterbot/i.test(userAgent || '');
}
function getBaseUrl() {
  const port = process.env.PORT || 3000;
  return process.env.BASE_URL ||
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);
}

// --- static
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  immutable: true,
  maxAge: '31536000',
  setHeaders(res) {
    // длинный кэш только для картинок (X это любит)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));
app.use(express.static('public'));
app.use(express.json());

// --- API: создать страницу (твоя логика, без изменений)
app.post('/api/create-post', async (req, res) => {
  try {
    const generator = new StaticHTMLGenerator();
    const result = await generator.generateRandomPost();
    res.json(result);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// --- Динамическая страница поста (добавлены только заголовки кэша для Twitterbot)
app.get('/post/:id', async (req, res) => {
  try {
    const userAgent = req.get('User-Agent') || '';
    const isBot = isTwitterBot(userAgent);

    const parts = (req.params.id || '').split('-');
    const slug = parts[0] || 'default';
    const username = parts[1] || 'user';
    const imageId = parts.length > 2 ? parts.slice(2).join('-') : '1';

    const generator = new StaticHTMLGenerator({ slug, username, imageId });
    const result = await generator.generatePost();

    res.set('Content-Type', 'text/html; charset=utf-8');
    // главное изменение варианта 1: боту не кэшируем HTML, людям можно чуть-чуть
    if (isBot) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=60');
    }

    res.send(result.html);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Error loading post');
  }
});

// --- sitemap (минимальный; не меняет твою логику)
app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const now = new Date().toISOString();
    // динамические URL у тебя «бесконечные», поэтому даём корневую страницу
    const urls = [ `${baseUrl}/` ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `<url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.5</priority></url>`).join('\n  ')}
</urlset>`;
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).send(xml);
  } catch (e) {
    res.status(500).send('');
  }
});

// --- главная (твоё исходное UI — не менял)
app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL ||
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
      <title>🐦 Twitter Card Demo</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                              <a href="\${data.url}" target="_blank" rel="noopener noreferrer">View Page</a> |
                              <a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(data.url)}" target="_blank" rel="noopener noreferrer">Share on Twitter</a>
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

