const { v1: uuidv1 } = require('uuid');
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Wallet = require('./wallet');

class Transaction {
  constructor() {
    this.id = uuidv1();
    this.input = null;
    this.outputs = [];
  }

  /**
   * Crée une nouvelle transaction signée par le wallet de l'émetteur
   * @param {Object} params
   * @param {Wallet} params.senderWallet - Le wallet de l'émetteur
   * @param {string} params.recipient - L'adresse publique du destinataire
   * @param {number} params.amount - Le montant à transférer
   * @returns {Transaction}
   */

  static createTransaction({ senderWallet, recipient, amount }) {
    const transaction = new Transaction();

    // Vérifier le solde
    if (amount > senderWallet.balance) {
      throw new Error('Montant excède le solde du portefeuille');
    }

    // Générer les outputs
    transaction.outputs.push(
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },  // reste pour l'émetteur
      { amount, address: recipient }                                               // pour le destinataire
    );

    // Préparer et signer l'input
    const outputHash = SHA256(JSON.stringify(transaction.outputs)).toString();

    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputHash)
    };

    return transaction;
  }

  /**
   * Vérifie la validité d'une transaction (intégrité + authenticité).
   * @param {Transaction} transaction
   * @returns {boolean}
   */

  static verifyTransaction(transaction) {
    const { input: { address, signature }, outputs } = transaction;

    // Recréer le hash des outputs
    const outputHash = SHA256(JSON.stringify(outputs)).toString();

    // Vérifier la signature avec la clé publique de l'émetteur
    const keyFromPublic = ec.keyFromPublic(address, 'hex');
    return keyFromPublic.verify(outputHash, signature);
  }
}

module.exports = Transaction;