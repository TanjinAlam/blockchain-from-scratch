const Transaction = require("./transaction");
const { writeTransactionsPool, getTransactionsPool } = require("../helper");

class TransactionPool {
  constructor() {
    // represents a collections of transactions in the pool
    this.transactions = getTransactionsPool();
  }

  /**
   * this method will add a transaction
   * it is possible that the transaction exists already
   * so it will replace the transaction with the new transaction
   * after checking the input id and adding new outputs if any
   * we call this method and replace the transaction in the pool
   */
  updateOrAddTransaction(transaction) {
    // get the transaction while checking if it exists
    let transactionWithId = this.transactions.find(
      (t) => t.id === transaction.id
    );

    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] =
        transaction;
    } else {
      this.transactions.push(transaction);
      writeTransactionsPool(this.transactions);
    }
  }

  /**
   * returns a existing transaction from the pool
   * if the inputs matches
   */

  existingTransaction(address, transactionPool) {
    console.log("transactionPooltransactionPool", transactionPool);
    // console.log(this.transactions[0].input.address.toString());
    return transactionPool.findIndex(
      (t) => t.input.address.toString() === address
    );
  }

  /**
   * sends valid transactions to the miner
   */

  validTransactions(transactionPoolData) {
    /**
     * valid transactions are the one whose total output amounts to the input
     * and whose signatures are same
     */
    this.transactions = transactionPoolData;
    console.log("THADSASD", this.transactions);
    // return this.transactions.filter((transaction) => {
    const allConfirmTransaction = this.transactions.filter((transaction) => {
      // reduce function adds up all the items and saves it in variable
      // passed in the arguments, second param is the initial value of the
      // sum total
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);
      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}`);
        return;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.input.address}`);
        return;
      }
      return transaction;
    });
    return allConfirmTransaction;
  }

  clear() {
    this.transactions = writeTransactionsPool([]);
  }
}

module.exports = TransactionPool;
