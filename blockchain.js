const Block = require('./block');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    const lastBlock = this.chain[this.chain.length - 1];
    const block = Block.mineBlock(lastBlock, data);
    this.chain.push(block);
    return block;
  }

  static blockHash(block) {
    // recalculer le hash du bloc
    return Block.hash(block.timestamp, block.lastHash, block.data);
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false; // Si le premier bloc n'est pas identique au Genesis
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (block.lastHash !== lastBlock.hash) {
        return false; // Le lastHash du bloc doit correspondre au hash du précédent
      }

      if (block.hash !== Blockchain.blockHash(block)) {
        return false; // Le hash doit correspondre aux données recalculées
      }
    }

    return true; // Si tous les blocs sont corrects
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log('Received chain is not longer than the current chain.');
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.log('Received chain is invalid.');
      return;
    }

    console.log('Replacing blockchain with the new chain.');
    this.chain = newChain;
  }
}

module.exports = Blockchain;
