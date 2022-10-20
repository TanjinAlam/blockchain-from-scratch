const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/index");
const { getBlockchain, writeBlockchain, getTransactionsPool } = require("../helper");
class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.p2pServer = p2pServer;
    this.wallet = wallet;
    this.transactionPool = transactionPool;
  }

  mine() {
    /**
     * 1. grab transaction from the pool that are valid
     * 2. create a block using the transactions
     * 3. synchronize the chain and include new block
     * 4. clear the transaction pool to remove confirmed transactions
     */

    const validTransactions = this.transactionPool.validTransactions(getTransactionsPool());
    console.log(validTransactions);
    // include reward for the miner in the valid transactions array
    // get the minner wallet
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );

    // create a block consisting of the valid transaction
    // keep running untill any block mine msg is broadcast
    console.log("validtrasaaisd", validTransactions)

    const block = this.blockchain.addBlock(validTransactions);

    // synchronize the chains in the p2p server
    // broadcast the message the block has been mined
    this.p2pServer.syncChain();

    // clear the transaction pool
    //feed the data into blockchain
    const entireBlockchainData = getBlockchain();
    entireBlockchainData.push;
    this.transactionPool.clear();

    // broadcast every miner to clear their pool

    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;
