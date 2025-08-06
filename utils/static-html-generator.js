const fs = require('fs').promises;
const path = require('path');

class StaticHTMLGenerator {
    constructor() {
        const PORT = process.env.PORT || 3000;
        const VERCEL_URL = process.env.VERCEL_URL;
        
        this.baseUrl = VERCEL_URL 
            ? `https://${VERCEL_URL}` 
            : `http://localhost:${PORT}`;
        
        this.postsDir = '/tmp/posts';
    }

    async generateHTML(postData) {
        const { title, description, imageUrl, slug } = postData;
        
        const cacheBuster = `?v=${Date.now()}`;
        const fullImageUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${this.baseUrl}${imageUrl}${cacheBuster}`;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${fullImageUrl}" />
    <meta property="og:url" content="${this.baseUrl}/post/${slug}" />
    <meta property="og:type" content="article" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${fullImageUrl}" />
    
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .post-image {
            width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
        }
        .post-title {
            color: #333;
            margin-bottom: 10px;
        }
        .post-description {
            color: #666;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <article>
        <h1 class="post-title">${title}</h1>
        <img src="${fullImageUrl}" alt="${title}" class="post-image" />
        <p class="post-description">${description}</p>
    </article>
</body>
</html>`;
    }

    async generateAndSavePost(postData) {
        try {
            await fs.mkdir(this.postsDir, { recursive: true });
            
            const html = await this.generateHTML(postData);
            const filePath = path.join(this.postsDir, `${postData.slug}.html`);
            
            await fs.writeFile(filePath, html, 'utf8');
            
            return {
                success: true,
                filePath,
                url: `${this.baseUrl}/post/${postData.slug}`
            };
        } catch (error) {
            console.error('Error generating post:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getPostHTML(slug) {
        try {
            const filePath = path.join(this.postsDir, `${slug}.html`);
            const html = await fs.readFile(filePath, 'utf8');
            return html;
        } catch (error) {
            console.error('Error reading post:', error);
            return null;
        }
    }
}

module.exports = StaticHTMLGenerator;