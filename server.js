require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 4000;
const rootDir = __dirname;
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && nodemailer.createTransport) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Email service initialized');
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) req.socket.destroy();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const email = (data.email || '').trim();
        const name = (data.name || '').trim();
        const projectType = (data.projectType || '').trim();
        const budget = (data.budget || '').trim();
        const message = (data.message || '').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
          return sendJson(res, 400, {error: 'A valid email is required.'});
        }

        // Send email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO,
          subject: 'New Contact Request - Motion Design Portfolio',
          html: `
            <h2>New Contact Request</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Name:</strong> ${name || 'Not provided'}</p>
            <p><strong>Project Type:</strong> ${projectType || 'Not selected'}</p>
            <p><strong>Budget:</strong> ${budget || 'Not selected'}</p>
            <p><strong>Message:</strong></p>
            <p>${message || 'No message'}</p>
          `,
        };

        // Try to send email, but don't fail if it errors
        if (transporter) {
          try {
            await transporter.sendMail(mailOptions);
            console.log('New contact request received and email sent:');
          } catch (emailError) {
            console.error('Email send failed:', emailError.message);
            console.log('Contact request received but email delivery failed:');
          }
        } else {
          console.log('Email service not configured. Contact request received:');
        }

        console.log(JSON.stringify({email, name, projectType, budget, message}, null, 2));
        return sendJson(res, 200, {success: true});
      } catch (error) {
        console.error('Error processing contact:', error);
        return sendJson(res, 500, {error: 'Internal server error.'});
      }
    });

    return;
  }

  if (req.method === 'GET') {
    let requestPath = req.url.split('?')[0];
    if (requestPath === '/') requestPath = '/motion-design-case-studies.html';
    const safePath = path.normalize(decodeURIComponent(requestPath)).replace(/^\/+/, '');
    const filePath = path.join(rootDir, safePath);
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      return res.end('Forbidden');
    }
    return serveFile(filePath, res);
  }

  res.writeHead(405, {'Content-Type': 'text/plain'});
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
