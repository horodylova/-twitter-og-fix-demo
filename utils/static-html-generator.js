const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class StaticHTMLGenerator {
  constructor(options = {}) {
    this.baseUrl = process.env.BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    this.slug = options.slug || null;
    this.username = options.username || null;
    this.imageId = options.imageId || '1';
    this.timestamp = options.timestamp || Date.now();
  }

  generateDynamicUrl() {
    if (this.slug && this.username && this.imageId) {
      return `${this.baseUrl}/post/${this.slug}/${this.username}/${this.imageId}`;
    }
    return `${this.baseUrl}/post`;
  }

  getDynamicImageUrl() {
    const imageIndex = parseInt(this.imageId) % 3 + 1;
    return `${this.baseUrl}/images/${imageIndex}.png?t=${this.timestamp}&v=${Math.random().toString(36).slice(2, 11)}`;
  }

  async simulateTwitterValidator(pageUrl, imageUrl) {
    try {
      const protocol = pageUrl.startsWith('https:') ? https : http;
      
      await new Promise((resolve, reject) => {
        const req = protocol.request(pageUrl, { method: 'HEAD' }, (res) => {
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(3000, () => {
          req.destroy();
          resolve();
        });
        req.end();
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const imageProtocol = imageUrl.startsWith('https:') ? https : http;
      await new Promise((resolve, reject) => {
        const req = imageProtocol.get(imageUrl, (res) => {
          res.on('data', () => {});
          res.on('end', resolve);
        });
        req.on('error', resolve);
        req.setTimeout(5000, () => {
          req.destroy();
          resolve();
        });
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async generatePost() {
    const pageData = this.getPageData();
    const html = this.buildHTML(pageData);
    
    setTimeout(() => {
      this.simulateTwitterValidator(pageData.pageUrl, pageData.imageUrl);
    }, 1000);
    
    return {
      html,
      url: this.generateDynamicUrl(),
      success: true
    };
  }

  async generateRandomPost() {
    const randomSlug = this.generateRandomSlug();
    const randomUsername = this.generateRandomUsername();
    const randomImageId = Math.floor(Math.random() * 3) + 1;
    const timestamp = Date.now();
    
    this.slug = randomSlug;
    this.username = randomUsername;
    this.imageId = randomImageId.toString();
    this.timestamp = timestamp;
    
    return await this.generatePost();
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