const express = require("express");
const Blockchain = require("../blockchain/index");
const bodyParser = require("body-parser");
const P2pserver = require("./p2p-server");
const Miner = require("./miner");

var CronJob = require("cron").CronJob;

const {
  getWallets,
  writeWallets,
  getWalletByPrivateKey,
  checkWalletExistByName,
  getTransactionsPool,
} = require("../helper");
//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const Wallet = require("../wallet");
const TransactionPool = require("../wallet/transaction-pool");

//create a new app
const app = express();

//using the blody parser middleware
app.use(bodyParser.json());

// create a new blockchain instance
const blockchain = new Blockchain();

// create a new wallet
const wallet = new Wallet();

// create a new transaction pool which will be later
// decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();

// create a p2p server instance with the blockchain and the transaction pool
const p2pserver = new P2pserver(blockchain, transactionPool);

// create a miner
const miner = new Miner(blockchain, transactionPool, wallet, p2pserver);
//EXPOSED APIs

//api to get the blocks
app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

//api to add blocks
app.post("/mine", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  /**
   * use the synchain method to synchronise the
   * state of the blockchain
   */
  p2pserver.syncChain();
  res.redirect("/blocks");
});

var job = new CronJob(
  "*/5 * * * * *",

  function () {
    startMine();
  },
  null,
  true,
  "America/Los_Angeles"
);

job.start();

function startMine() {
  //get the transaction poolw
  let transactionToConfirm = getTransactionsPool();
  if (transactionToConfirm.length > 0) {
    const block = miner.mine();
    console.log(`New block added: ${block.toString()}`);
  }
}

// api to start mining
app.get("/mine-transactions", (req, res) => {
  //after complete mining send wallet details
  //start the socket server for mining
  const block = miner.mine();
  // console.log(`New block added: ${block.toString()}`);
  // res.redirect("/blocks");
});

// api to view transaction in the transaction pool
app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

// create transactions
app.post("/transaction/create", (req, res) => {
  const { recipient, amount, privateKey } = req.body;

  let senderWallet = getWalletByPrivateKey(privateKey);
  if (senderWallet) {
    const transaction = wallet.createTransaction(
      senderWallet,
      recipient,
      amount,
      blockchain,
      transactionPool,
      getTransactionsPool()
    );
    // p2pserver.broadcastTransaction(transaction);
    // res.redirect("/transactions");
    res.send("Transaction successfull");
    //make sockets alert to start miningsssssssss
  } else {
  }
});

// create wallet
app.post("/wallet/create", (req, res) => {
  const { name } = req.body;
  console.log("OWNER NAME", name);
  // create a new wallet
  let walletIsExist = checkWalletExistByName(name);
  console.log(walletIsExist);
  if (!walletIsExist) {
    const wallet = new Wallet();
    const allWallets = getWallets();
    allWallets[name] = wallet.getWallet();
    writeWallets(allWallets);
    res.json(wallet.getWallet());
  } else {
    res.json(`User ${name} already exist enter a new name`);
  }
});

// get wallet details by privateKey
app.get("/wallet/create", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

// app server configurations
app.listen(HTTP_PORT, () => {
  console.log(`listening on port ${HTTP_PORT}`);
});

// p2p server configuration
p2pserver.listen();
