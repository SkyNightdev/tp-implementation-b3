const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactionMap = {}; 
  }

  /**
   * Met à jour ou ajoute une transaction dans le pool.
   * Si une transaction avec la même clé publique existe, elle est remplacée.
   * @param {Transaction} transaction
   */

  updateOrAddTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  /**
   * Recherche une transaction existante d'un expéditeur donné.
   * @param {string} address - Clé publique de l'émetteur
   * @returns {Transaction|undefined}
   */

  existingTransaction(address) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(tx => tx.input.address === address);
  }

  /**
   * Renvoie toutes les transactions valides du pool.
   * @returns {Transaction[]}
   */

  validTransactions() {
    return Object.values(this.transactionMap).filter(transaction =>
      Transaction.verifyTransaction(transaction)
    );
  }

  /**
   * Vide le pool après le minage.
   * @param {Array<Transaction>} minedTransactions
   */

  clearMinedTransactions(minedTransactions) {
    for (let tx of minedTransactions) {
      delete this.transactionMap[tx.id];
    }
  }

  /**
   * Vide complètement le pool.
   */
  clear() {
    this.transactionMap = {};
  }
}

module.exports = TransactionPool;