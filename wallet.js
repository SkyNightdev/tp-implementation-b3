const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { v1: uuidv1 } = require('uuid');
const SHA256 = require('crypto-js/sha256');

class Wallet {
  constructor() {
    this.balance = 1000;               
    this.keyPair = ec.genKeyPair();   
    this.publicKey = this.keyPair.getPublic('hex');  
  }

  /**
   * @param {string} dataHash - Le hash (hex) des données à signer.
   * @returns {string} - La signature au format DER hexadécimal.
   */
  sign(dataHash) {
    return this.keyPair.sign(dataHash).toDER('hex');
  }

  /** 
   * @param {Block[]} chain - La blockchain (tableau de blocs).
   * @param {string} address - L'adresse (clé publique hex) du wallet.
   * @returns {number} - Solde calculé de l'adresse.
   */

  static calculateBalance(chain, address) {
    let balance = 0;

    for (const block of chain) {
      for (const transaction of block.data) {

        if (transaction.input.address === address) {
          const output = transaction.outputs.find(o => o.address === address);
          balance = output ? output.amount : 0;
        }

        const recipientOutput = transaction.outputs.find(o => o.address === address);
        if (recipientOutput) {
          balance += recipientOutput.amount;
        }
      }
    }

    return balance;
  }
}

module.exports = Wallet;