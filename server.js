const express = require('express');
const path = require('path');
const StaticHTMLGenerator = require('./utils/static-html-generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/images', express.static(path.join(__dirname, 'public/images'), {
    maxAge: '1d',
    etag: false
}));

const generator = new StaticHTMLGenerator();

app.get('/post/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const html = await generator.getPostHTML(slug);
        
        if (html) {
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        console.error('Error serving post:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/api/create-post', async (req, res) => {
    try {
        const { title, description, imageUrl, slug } = req.body;
        
        if (!title || !description || !imageUrl || !slug) {
            return res.status(400).json({ 
                error: 'Missing required fields: title, description, imageUrl, slug' 
            });
        }

        const result = await generator.generateAndSavePost({
            title,
            description,
            imageUrl,
            slug
        });

        if (result.success) {
            res.json({
                success: true,
                url: result.url,
                message: 'Post created successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error in create-post API:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Twitter OG Fix Demo API',
        endpoints: {
            'POST /api/create-post': 'Create a new post with OG tags',
            'GET /post/:slug': 'View generated post'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});