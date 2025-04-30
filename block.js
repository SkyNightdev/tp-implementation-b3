// block.js
const SHA256 = require('crypto-js/sha256');
const data = 'Hello Blockchain!';
const hash = SHA256(data).toString();
console.log(hash);

class Block {
    constructor(timestamp, lastHash, hash, data) {
      this.timestamp = timestamp;
      this.lastHash = lastHash;
      this.hash = hash;
      this.data = data;
    }
  
    toString() {
      return `Block -
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0, 10)}...
        Hash      : ${this.hash.substring(0, 10)}...
        Data      : ${this.data}
      `;
    }
  
    static genesis() {
      return new this('Genesis time', '----', 'genesis-hash', []);
    }
  
    static hash(timestamp, lastHash, data) {
      return SHA256(`${timestamp}${lastHash}${JSON.stringify(data)}`).toString();
    }
  
    static mineBlock(lastBlock, data) {
      const timestamp = Date.now();
      const lastHash = lastBlock.hash;
      const hash = Block.hash(timestamp, lastHash, data);
      return new this(timestamp, lastHash, hash, data);
    }
  }
  
  module.exports = Block;  