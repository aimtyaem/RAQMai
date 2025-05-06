const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const open = require('open');

const PORT = 8001;
const BASE_DIR = path.resolve(__dirname);

// Secure, async handler
const requestHandler = async (req, res) => {
    try {
        let safePath = req.url.split('?')[0]; // Remove query params
        safePath = decodeURIComponent(safePath);
        if (safePath === '/' || safePath === '') {
            safePath = '/demo.html';
        }

        // Prevent path traversal (e.g., ../../etc/passwd)
        const filePath = path.join(BASE_DIR, safePath);
        if (!filePath.startsWith(BASE_DIR)) {
            res.writeHead(400);
            return res.end('Invalid request');
        }

        // Content Types Map
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.json': 'application/json',
            '.glb': 'model/gltf-binary',
            '.gltf': 'model/gltf+json',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        // Read & Serve File
        const data = await fs.readFile(filePath);
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600' // Cache static assets
        });
        res.end(data);

    } catch (err) {
        if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
        } else {
            console.error('Server error:', err);
            res.writeHead(500);
            res.end('Server error');
        }
    }
};

// Start Server
const server = http.createServer(requestHandler);
server.listen(PORT, async (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }

    console.log(`✅ Serving VR Training at http://localhost:${PORT}`);
    try {
        await open(`http://localhost:${PORT}/demo.html`);
    } catch (e) {
        console.error('Error opening browser:', e);
    }
});