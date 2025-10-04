// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware CORS / PNA
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

server.use(middlewares);
server.use(router);

const PORT = 3000;
const HOST = '172.27.62.200'; // tu IP de ZeroTier
server.listen(PORT, HOST, () => {
  console.log(`JSON Server running at http://${HOST}:${PORT}`);
});
