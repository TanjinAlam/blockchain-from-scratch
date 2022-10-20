const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const ChainUtil = require("../chain-util");
const { MINING_REWARD } = require("../config");
const {
  getTransactions,
  writeTransactions,
  getWalletByPrivateKey,
  writeTransactionsPool,
  getTransactionsPool,
} = require("../helper");
class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  /**
   * add extra ouputs to the transactions
   */

  update(senderWallet, recipient, amount) {
    const senderOutput = this.outputs.find(
      (output) => output.address === senderWallet.publicKey
    );

    if (amount > senderWallet.amount) {
      console.log(`Amount ${amount} exceeds balance`);
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;
    this.outputs.push({ amount: amount, address: recipient });
    writeTransactions(this.outputs);
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  /**
   * create a new transaction
   */

  static newTransaction(transactionIndex, senderWallet, recipient, amount) {
    // checking send ammount is less than current amount
    if (amount > senderWallet.balance) {
      console.log(`Amount : ${amount} exceeds the balance`);
      return;
    }
    // call to the helper function that creates and signs the transaction outputs
    return Transaction.transactionWithOutputs(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      { amount: amount, address: recipient },
    ]);
  }

  /**
   * helper function
   */

  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this(); //getting input ,output, id
    transaction.outputs.push(...outputs);
    console.log("TRANSACTION==========", transaction);
    Transaction.signTransaction(transaction, senderWallet);
    const allTransactions = getTransactions();
    allTransactions.push(transaction);
    writeTransactionsPool(allTransactions);
    return allTransactions;
  }

  /**
   * create input and sign the outputs
   */

  static signTransaction(transaction, senderWallet) {
    // console.log("senderWallet", senderWallet);
    var key = ec.keyFromPrivate(senderWallet.privateKey);
    // console.log(key.getPublic("hex"));
    // console.log(key.getPrivate().toString());
    let privKey = key.getPrivate("hex");
    let pubKey = key.getPublic();
    // console.log("pubkey", pubKey);
    // console.log(`Private key: ${privKey}`);
    // console.log("Public key :", pubKey.encode("hex"));
    // console.log("Public key (compressed):", pubKey.encodeCompressed("hex"));

    let hashMsg = ChainUtil.hash(transaction.outputs);
    let signValue = ec.sign(hashMsg, privKey, "hex", {
      canonical: true,
    });
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: signValue,
    };

    // let hexToDecimal = (x) =>
    //   ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    // let pubKeyRecovered = ec.recoverPubKey(
    //   hexToDecimal(hashMsg),
    //   signValue,
    //   signValue.recoveryParam,
    //   "hex"
    // );
    let key1 = ec.keyFromPublic(pubKey, "hex");
    // console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));
    // let validSig = ec.verify(hashMsg, signValue, pubKeyRecovered);
    // console.log("Signature valid?", validSig);
    console.log(ec.verify(hashMsg, transaction.input.signature, key1));
  }

  static signTransactionWithBlockChainWallet(transaction, senderWallet) {
    // console.log("senderWallet", senderWallet);
    var key = ec.keyFromPrivate(senderWallet.privateKey);
    // console.log(key.getPublic("hex"));
    // console.log(key.getPrivate().toString());
    let privKey = key.getPrivate("hex");
    let pubKey = key.getPublic();
    // console.log("pubkey", pubKey);
    // console.log(`Private key: ${privKey}`);
    // console.log("Public key :", pubKey.encode("hex"));
    // console.log("Public key (compressed):", pubKey.encodeCompressed("hex"));

    let hashMsg = ChainUtil.hash(transaction.outputs);
    let signValue = ec.sign(hashMsg, privKey, "hex", {
      canonical: true,
    });
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey.encodeCompressed("hex"),
      signature: signValue,
    };

    // let hexToDecimal = (x) =>
    //   ec.keyFromPrivate(x, "hex").getPrivate().toString(10);
    // let pubKeyRecovered = ec.recoverPubKey(
    //   hexToDecimal(hashMsg),
    //   signValue,
    //   signValue.recoveryParam,
    //   "hex"
    // );
    // let key1 = ec.keyFromPublic(pubKey, "hex");
    // console.log("Recovered pubKey:", pubKeyRecovered.encodeCompressed("hex"));
    // let validSig = ec.verify(hashMsg, signValue, pubKeyRecovered);
    // console.log("Signature valid?", validSig);
    // console.log(ec.verify(hashMsg, transaction.input.signature, key1));
  }
  /**
   * verify the transaction by decrypting and matching
   */

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }

  /**
   * helper function
   */

  static transactionWithOutputsReward(senderWallet, outputs) {
    const transaction = new this(); //getting input ,output, id
    transaction.outputs.push(outputs);
    console.log("TRANSACTION==========", transaction);
    Transaction.signTransactionWithBlockChainWallet(transaction, senderWallet);
    return transaction;
  }

  static rewardTransaction(minerWallet, blockchainWallet) {
    console.log(minerWallet.publicKey.encodeCompressed("hex"));
    return Transaction.transactionWithOutputsReward(blockchainWallet, {
      amount: MINING_REWARD,
      address: minerWallet.publicKey.encodeCompressed("hex"),
    });
  }
}

module.exports = Transaction;
