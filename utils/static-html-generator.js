const fs = require('fs').promises;
const path = require('path');

class StaticHTMLGenerator {
  constructor() {
    this.outputDir = process.env.STATIC_PAGES_DIR || './public/static-pages';
    this.baseUrl = process.env.BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';
    this.imageUrl = `${this.baseUrl}/images/1.png`;
  }

  async generatePost() {
    const pageData = this.getPageData();
    const html = this.buildHTML(pageData);
    
    const filePath = path.join(this.outputDir, 'post.html');
    await this.ensureDirectoryExists(path.dirname(filePath));
    await fs.writeFile(filePath, html, 'utf8');
    
    return {
      filePath,
      url: `${this.baseUrl}/post`,
      success: true
    };
  }

  getPageData() {
    const pageUrl = `${this.baseUrl}/post`;
    
    return {
      title: 'Special Offer - Limited Time',
      description: 'Amazing opportunity just for you! Get exclusive access to our premium service.',
      imageUrl: this.imageUrl,
      pageUrl
    };
  }

  buildHTML(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <title>${data.title}</title>
  <meta name="description" content="${data.description}" />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${data.pageUrl}" />
  <meta property="og:title" content="${data.title}" />
  <meta property="og:description" content="${data.description}" />
  <meta property="og:image" content="${data.imageUrl}" />
  <meta property="og:site_name" content="Special Offers" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${data.title}" />
  <meta name="twitter:description" content="${data.description}" />
  <meta name="twitter:image" content="${data.imageUrl}" />
  
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
    <img src="${data.imageUrl}" alt="${data.title}" class="hero-image" />
    <p class="description">${data.description}</p>
    <a href="#" class="cta-button">Get Started Now</a>
  </div>
</body>
</html>`;
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
}

module.exports = StaticHTMLGenerator;