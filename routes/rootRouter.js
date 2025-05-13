const express = require('express');

const rootRouter = express.Router();

// Per REQ 5.a.
rootRouter.all('/', (req, res) => {
    if (req.accepts('text/html')) {
        return res.send("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>INF653 Final Project</title><style>body {font-family: Arial, sans-serif;margin: 0;padding: 0;background-color: #000099;display: flex;justify-content: space-between;align-items: center;height: 100dvh;flex-direction: column;}.container {max-width: 650px;width: 80%;text-align: center;background-color: #0000ff;padding: 20px;border-radius: 8px;box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);}h1 {color: #D3D3D3;text-shadow: black 2px 2px 5px;}p, a {color: white;}footer {margin: 10px;text-align: center;color: #999;font-size: 0.8em;}</style></head><body><div style=\"height: 1px;\"></div><div class=\"container\"><h1>Welcome to my INF653 Final Project</h1><p>This project is a Node.js API backend. Details at the GitHub link below.</p><a href=\"https://github.com/your-github-username/your-project-name\" target=\"_blank\">GitHub Repository</a></div><footer>&copy; 2025 Judson Hartley. All rights reserved.</footer></body></html>");
    } else {
        return res.status(404).json({ error: '404 Not Found' });
    }
});

// Per REQ 5.c.
rootRouter.get('/yH.gif', (req, res) => {
    const options = {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
    };
    return res.sendFile('yH.gif', options);
});

module.exports = rootRouter;