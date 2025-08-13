const url = require('url');

class StaticHTMLGenerator {
  constructor(options = {}) {
    const PORT = process.env.PORT || 3000;
    this.baseUrl = process.env.BASE_URL ||
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

    this.slug = options.slug || null;
    this.username = options.username || null;
    this.imageId = options.imageId || '1';
  }

  getDynamicImageUrl() {
    try {
      let id = 1;
      if (typeof this.imageId === 'string' && this.imageId.includes('-')) {
        const parts = this.imageId.split('-');
        id = parseInt(parts[parts.length - 1], 10) || 1;
      } else {
        id = parseInt(this.imageId, 10) || 1;
      }
      const imageIndex = ((id - 1) % 3) + 1; // 1..3
      return new url.URL(`/images/${imageIndex}.png`, this.baseUrl).toString();
    } catch {
      return new url.URL('/images/1.png', this.baseUrl).toString();
    }
  }

  generateDynamicUrl() {
    try {
      if (this.slug && this.username && this.imageId) {
        return new url.URL(`/post/${this.slug}-${this.username}-${this.imageId}`, this.baseUrl).toString();
      }
      return new url.URL('/post', this.baseUrl).toString();
    } catch {
      return new url.URL('/post', this.baseUrl).toString();
    }
  }

  getPageData() {
    const pageUrl = this.generateDynamicUrl();
    const imageUrl = this.getDynamicImageUrl();
    return {
      title: 'Special Offer - Limited Time',
      description: 'Amazing opportunity just for you! Get exclusive access to our premium service.',
      imageUrl,
      pageUrl
    };
  }

  buildHTML(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.description)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(data.title)}" />
  <meta property="og:description" content="${escapeHtml(data.description)}" />
  <meta property="og:image" content="${data.imageUrl}" />
  <meta property="og:url" content="${data.pageUrl}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(data.title)}" />
  <meta name="twitter:description" content="${escapeHtml(data.description)}" />
  <meta name="twitter:image" content="${data.imageUrl}" />

  <link rel="canonical" href="${data.pageUrl}" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f7f7f8; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); text-align: center; }
    h1 { color: #111; margin: 0 0 16px; font-size: 28px; }
    p { color: #555; margin: 0 0 16px; }
    img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: 24px 0; }
    a.btn { display:inline-block; background:#1da1f2; color:#fff; text-decoration:none; padding:12px 20px; border-radius:999px; font-weight:600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">✅ Limited Offer</div>
    <h1>${escapeHtml(data.title)}</h1>
    <img src="${data.imageUrl}" alt="${escapeHtml(data.title)}" class="hero-image">
    <p class="description">${escapeHtml(data.description)}</p>
    <p><a class="btn" href="${data.pageUrl}">Share</a></p>
  </div>
</body>
</html>`;
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

module.exports = StaticHTMLGenerator;




