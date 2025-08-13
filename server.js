require('dotenv').config();
const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');

const app = express();
const PORT = process.env.PORT || 3000;


function isTwitterBot(userAgent = '') {
  return /twitterbot/i.test(userAgent || '');
}
function getBaseUrl() {
  const port = process.env.PORT || 3000;
  return process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`);
}

 
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, filePath) {
    if (/\.(html|xml|txt)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
  }
}));
 
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  immutable: true,
  maxAge: '31536000',
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));
 
app.get('/_health', (_, res) => res.status(200).send('ok'));

 
app.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = getBaseUrl();
    const urls = [
      `${baseUrl}/post/amazing-jane-1`,
      `${baseUrl}/post/special-alex-2`,
      `${baseUrl}/post/limited-sam-3`
    ];
    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `<url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`).join('\n  ')}
</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).send(xml);
  } catch {
    res.status(500).send('');
  }
});
 
app.get('/post/:id', (req, res) => {
  try {
    const ua = req.get('User-Agent') || '';
    const bot = isTwitterBot(ua);

    const parts = (req.params.id || '').split('-');
    const slug = parts[0] || 'default';
    const username = parts[1] || 'user';
    const imageId = parts.length > 2 ? parts.slice(2).join('-') : '1';

    const generator = new StaticHTMLGenerator({ slug, username, imageId });
    const html = generator.buildHTML(generator.getPageData());

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (bot) {
      
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=60');
    }

    res.status(200).send(html);
  } catch (err) {
    console.error('Error rendering post:', err);
    res.status(500).send('Server error');
  }
});

 
app.get('/', (req, res) => {
  const baseUrl = getBaseUrl();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Twitter Card Demo</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 40px auto; padding: 20px;">
  <h1>Twitter Card Demo</h1>
  <p>Open any URL below and share it on X/Twitter:</p>
  <ul>
    <li><a href="${baseUrl}/post/amazing-jane-1">${baseUrl}/post/amazing-jane-1</a></li>
    <li><a href="${baseUrl}/post/special-alex-2">${baseUrl}/post/special-alex-2</a></li>
    <li><a href="${baseUrl}/post/limited-sam-3">${baseUrl}/post/limited-sam-3</a></li>
  </ul>
</body>
</html>`);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}
module.exports = app;
