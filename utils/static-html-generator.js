const fs = require('fs').promises;
const path = require('path');

class StaticHTMLGenerator {
  constructor(options = {}) {
    const PORT = process.env.PORT || 3000;
    this.baseUrl = process.env.BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);
    
    this.slug = options.slug || null;
    this.username = options.username || null;
    this.imageId = options.imageId || '1';
  }

  generateDynamicUrl() {
    if (this.slug) {
      return `${this.baseUrl}/post/${this.slug}`;
    }
    return `${this.baseUrl}/post`;
  }

  getDynamicImageUrl() {
    const imageId = parseInt(this.imageId) || 1;
    const imageIndex = ((imageId - 1) % 3) + 1;
    return `${this.baseUrl}/images/${imageIndex}.png?1`;
  }

  async generatePost() {
    const pageData = this.getPageData();
    const html = this.buildHTML(pageData);
    
    return {
      html,
      url: this.generateDynamicUrl(),
      success: true
    };
  }

  async generateAndSavePost() {
    const result = await this.generatePost();
    
    const postsDir = path.join(__dirname, '..', 'public', 'posts');
    await fs.mkdir(postsDir, { recursive: true });
    
    const filePath = path.join(postsDir, `${this.slug}.html`);
    await fs.writeFile(filePath, result.html);
    
    return {
      ...result,
      filePath
    };
  }

  async generateRandomPost() {
    const randomSlug = this.generateRandomSlug();
    const randomUsername = this.generateRandomUsername();
    const randomImageId = Math.floor(Math.random() * 3) + 1;
    
    this.slug = randomSlug;
    this.username = randomUsername;
    this.imageId = randomImageId.toString();
    
    return await this.generateAndSavePost();
  }

  generateRandomSlug() {
    const slugs = [
      'amazing-offer',
      'special-deal',
      'exclusive-access',
      'limited-time',
      'premium-service',
      'best-opportunity'
    ];
    return slugs[Math.floor(Math.random() * slugs.length)];
  }

  generateRandomUsername() {
    const usernames = [
      'user123',
      'customer456',
      'member789',
      'client001',
      'subscriber999'
    ];
    return usernames[Math.floor(Math.random() * usernames.length)];
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
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <title>${data.title}</title>
  <meta name="description" content="${data.description}">
  
  <meta property="og:type" content="website">
  <meta property="og:url" content="${data.pageUrl}">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:image" content="${data.imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Special Offers">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="${data.imageUrl}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      text-align: center;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .badge {
      background: #28a745;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
      display: inline-block;
    }
    h1 {
      color: #333;
      margin: 20px 0;
      font-size: 2.2em;
      line-height: 1.2;
    }
    .hero-image {
      max-width: 100%;
      height: auto;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      margin: 30px 0;
    }
    .description {
      color: #666;
      line-height: 1.6;
      font-size: 1.1em;
      margin: 30px 0;
    }
    .cta-button {
      background: linear-gradient(45deg, #1da1f2, #0d8bd9);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 50px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      margin: 20px 0;
      transition: transform 0.2s;
      text-decoration: none;
      display: inline-block;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">✅ Limited Offer</div>
    <h1>${data.title}</h1>
    <img src="${data.imageUrl}" alt="${data.title}" class="hero-image">
    <p class="description">${data.description}</p>
    <a href="#" class="cta-button">Get Started Now</a>
  </div>
</body>
</html>`;
  }
}

module.exports = StaticHTMLGenerator;