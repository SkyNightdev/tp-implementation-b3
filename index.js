const express = require('express');
const bodyParser = require('body-parser');

const Blockchain = require('./blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('./wallet');
const Transaction = require('./transaction');
const TransactionPool = require('./transaction-pool');

const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockchain, transactionPool);

app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
  const { data } = req.body;
  const block = blockchain.addBlock(data);
  console.log(`New block added: ${block.toString()}`);

  // Synchronise la chaîne
  p2pServer.syncChains();

  res.json({
    message: 'New block added successfully',
    block
  });
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;

  let transaction = transactionPool.existingTransaction(wallet.publicKey);

  try {
    // Crée ou met à jour la transaction
    transaction = Transaction.createTransaction({
      senderWallet: wallet,
      recipient,
      amount
    });

    transactionPool.updateOrAddTransaction(transaction);

    // Broadcast P2P de la transaction
    p2pServer.broadcastTransaction(transaction);

    res.json({ transaction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/transactions', (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get('/mine-transactions', (req, res) => {
  // Récupérer les transactions valides
  const validTxs = transactionPool.validTransactions();

  // Ajouter la transaction de récompense pour ce mineur
  const rewardTx = Transaction.createTransaction({
    senderWallet: wallet,         
    recipient: wallet.publicKey,
    amount: Blockchain.reward      
  });
  validTxs.push(rewardTx);

  // Miner un nouveau bloc avec ces transactions
  const block = blockchain.addBlock(validTxs);

  console.log(`New block with transactions mined: ${block.toString()}`);

  // Synchroniser la chaîne et vider le pool des tx minées
  p2pServer.syncChains();
  transactionPool.clearMinedTransactions(validTxs);

  // Envoyer la transaction de récompense en broadcast
  p2pServer.broadcastTransaction(rewardTx);

  res.json({ message: 'Block mined with transactions', block });
});

// Port HTTP pour l'API REST
const HTTP_PORT = process.env.HTTP_PORT || 3001;
app.listen(HTTP_PORT, () => {
  console.log(`HTTP Server listening on port ${HTTP_PORT}`);
});

p2pServer.listen();