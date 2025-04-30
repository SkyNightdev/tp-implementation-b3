const express = require('express');
const Blockchain = require('./blockchain');
const P2pServer = require('./p2p-server');

const app = express();
const blockchain = new Blockchain();
const p2pServer = new P2pServer(blockchain);

app.use(express.json());

// Route pour afficher les blocs
app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

// Route pour miner un bloc
app.post('/mine', (req, res) => {
  const { data } = req.body;
  const block = blockchain.addBlock(data);

  p2pServer.syncChains(); 

  res.json({
    message: 'New block added',
    block
  });
});

const PORT = process.env.HTTP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

p2pServer.listen();