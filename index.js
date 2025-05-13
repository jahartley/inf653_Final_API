//const wtf = require('wtfnode');

require("dotenv").config();
const { connectDB, closeDB } = require("./dbConfig");
const express = require("express");
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/api/authRouter');
const eventsRouter = require('./routes/api/eventsRouter');
const bookingsRouter = require('./routes/api/bookingsRouter');
const rootRouter = require('./routes/rootRouter');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (process.env.SHUTTING_DOWN) {
    res.setHeader('Connection', 'close');
  }
  next();
});

// Per REQ 5.b.
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);

// Per REQ 5.a.
app.use('/', rootRouter);

// Per REQ 5.c.
app.all('/{*splat}', (req, res) => {
    if (req.accepts('text/html')) {
        return res.status(404).send("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>INF653 Final Project</title><style>body {font-family: Arial, sans-serif;margin: 0;padding: 0;background-color: #000099;display: flex;justify-content: space-between;align-items: center;height: 100dvh;flex-direction: column;}.container {max-width: 650px;width: 80%;text-align: center;background-color: #0000ff;padding: 20px;border-radius: 8px;box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);}h1 {color: #D3D3D3;text-shadow: black 2px 2px 5px;}p, a {color: white;}footer {margin: 10px;text-align: center;color: #999;font-size: 0.8em;}img {width: 90%;}</style></head><body><div style=\"height: 1px;\"></div><div class=\"container\"><a href=\"/\" style=\"text-decoration:none;\"><h1>404</h1><img src=\"yH.gif\"></a></div><footer>&copy; 2025 Judson Hartley. All rights reserved.</footer></body></html>");
    } else {
        return res.status(404).json({ error: '404 Not Found' });
    }
});

let server;
const startServer = async () => {
  try {
    console.log('Server Startup...');
    await connectDB();
    server = await app.listen(process.env.PORT, () => {
      console.log(`API SERVER RUNNING ON PORT ${process.env.PORT}`);
    });
  } catch (err) {
    console.log('Fatal error', err)
  }
  
};

const shutdownServer = async () => {
  console.log('Shutdown initiated...');
  process.env.SHUTTING_DOWN = true;
  try {
    await server.close(() => console.log('HTTP server closed.'));
    await closeDB();
    console.log('MongoDB connection closed.');
    if (process.env.NODE_ENV != 'test') process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

const startTest = async () => {
  try {
    console.log('Server Test Startup');
    await connectDB();
    console.log('...Ready');
  } catch (err) {
    console.log('Fatal error', err)
  }
  
};

const shutdownTest = async () => {
  console.log('TEST Shutdown initiated...');
  process.env.SHUTTING_DOWN = true;
  try {
    await closeDB();
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdownServer);
process.on('SIGINT', shutdownServer);

console.log(`NODE_ENV is : ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV == 'production') {
  startServer();
}

module.exports = { startServer, shutdownServer, app, startTest, shutdownTest };