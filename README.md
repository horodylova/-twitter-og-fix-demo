🐦 Twitter Cards Generator

A dynamic web application that generates optimized social media preview pages with Twitter Cards integration for maximum engagement and professional sharing.

✨ Features

🎯 Dynamic HTML Generation - Real-time page creation with customizable content
🏷️ Twitter Cards Integration - Proper Open Graph and Twitter meta tags
📱 Responsive Design - Modern UI with gradient backgrounds and smooth animations
🚀 API-First Architecture - RESTful endpoints for seamless integration
🖼️ Image Optimization - Proper MIME types and social media crawler headers
⚡ Performance Optimized - Smart caching and static file serving
🔗 Social Sharing Ready - Direct Twitter intent integration

🛠️ Tech Stack

Backend: Node.js, Express.js
Frontend: HTML5, CSS3, Vanilla JavaScript
Deployment: Vercel
Social Integration: Open Graph Protocol, Twitter Cards API

🚀 Quick Start
Prerequisites

Node.js (≥14.0.0)
npm or yarn

Installation
bash# Clone the repository
git clone https://github.com/yourusername/twitter-cards-generator.git
cd twitter-cards-generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
Environment Variables
envPORT=3000
BASE_URL=https://yourdomain.com
VERCEL_URL=your-project.vercel.app
📋 API Reference
Generate New Post
httpPOST /api/create-post
Response:
json{
  "html": "<generated-html>",
  "url": "https://yourdomain.com/post",
  "success": true
}
View Generated Post
httpGET /post
Returns the generated HTML page with proper Twitter Cards meta tags.
Test Image URL
httpGET /test-image
Response:
json{
  "imageUrl": "https://yourdomain.com/images/1.png",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "message": "Test this URL directly in browser"
}
🏗️ Project Structure
twitter-cards-generator/
├── 📁 public/
│   └── 📁 images/
│       └── 1.png
├── 📁 utils/
│   └── static-html-generator.js
├── 📄 server.js
├── 📄 package.json
└── 📄 README.md
🎨 Key Components
StaticHTMLGenerator Class
The core engine that creates optimized HTML pages with:

✅ Proper Open Graph meta tags
✅ Twitter Cards implementation
✅ HTML escaping for security
✅ Responsive design
✅ SEO optimization

javascriptconst generator = new StaticHTMLGenerator();
const result = await generator.generatePost();
Express Server Configuration

🛡️ Security headers and CORS configuration
📦 Static file serving with optimized caching
🤖 Bot-friendly headers for social media crawlers
⚡ Performance optimizations

🔧 Usage Examples
Basic Implementation
javascript// Generate a new social media post
const response = await fetch('/api/create-post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
console.log('Generated URL:', data.url);
Share on Twitter
javascriptconst twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}`;
window.open(twitterUrl, '_blank');
🧪 Testing & Validation
Twitter Cards Validator
Test your generated pages with the official Twitter validator:
https://cards-dev.twitter.com/validator
Manual Testing

Generate a new post via the web interface
Copy the generated URL
Paste into Twitter Cards Validator
Verify image and meta tags load correctly

📱 Social Media Integration
Supported Platforms

✅ Twitter - summary_large_image cards
✅ Facebook - Open Graph integration
✅ LinkedIn - Professional sharing optimization
✅ Telegram - Instant preview support

Meta Tags Implementation

#bash
<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your Description">
<meta property="og:image" content="https://yourdomain.com/images/1.png">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Title">
<meta name="twitter:description" content="Your Description">
<meta name="twitter:image" content="https://yourdomain.com/images/1.png">

#bash

🎯 Performance Features

Image Optimization: Proper MIME types and caching headers
CDN Ready: Static assets optimized for global delivery
Crawler Friendly: Optimized for social media bots
Fast Response Times: Efficient HTML generation
SEO Optimized: Structured data and meta tags

🚀 Deployment
Vercel (Recommended)

Push code to GitHub repository
Connect to Vercel dashboard
Configure environment variables
Deploy automatically

Manual Deployment
bash# Build for production
npm run build

# Start production server
npm start
🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙋‍♀️ Support

📧 Email: horodylova.sv@gmail.com
💼 LinkedIn: [Your Profile](https://www.linkedin.com/in/svitlana-horodylova/)


<div align="center">
  <strong>Made with ❤️ for better social media sharing</strong>
</div>
