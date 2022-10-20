const { readFileSync, writeFileSync } = require("fs");

/** blockchain helpers **/
function getBlockchain() {
  const blockchainFile = readFileSync("./blockchain.json");
  const blockchain = JSON.parse(blockchainFile);
  return blockchain;
}

function getTransactions() {
  const transactionsFile = readFileSync("./transactions.json");
  const transactions = JSON.parse(transactionsFile);
  return transactions;
}

function getTransactionsPool() {
  const transactionsFile = readFileSync("./transactionsPool.json");
  const transactions = JSON.parse(transactionsFile);
  return transactions;
}

function writeTransactionsPool(transactionsPool) {
  const transactionsPoolString = JSON.stringify(transactionsPool, null, 2);
  writeFileSync("./transactionsPool.json", transactionsPoolString);
}

function writeBlockchain(blockchain) {
  const blockchainString = JSON.stringify(blockchain, null, 2);
  writeFileSync("./blockchain.json", blockchainString);
}

function writeTransactions(transactions) {
  const transactionsString = JSON.stringify(transactions, null, 2);
  writeFileSync("./transactions.json", transactionsString);
}

/** wallet helpers **/

function getWallets() {
  const walletsFile = readFileSync("./wallets.json");
  const wallets = JSON.parse(walletsFile);
  return wallets;
}

function writeWallets(wallets) {
  const walletsString = JSON.stringify(wallets, null, 2);
  writeFileSync("./wallets.json", walletsString);
}

function updateWallet(userWallet) {
  const wallets = getWallets();
  for (wallet in wallets) {
    if (wallets[wallet].privateKey == userWallet.privateKey) {
      wallets[wallet] = userWallet;
      return;
    }
  }
  writeFileSync("./wallets.json", walletsString);
}

function checkWalletExistByName(name) {
  const wallets = getWallets();
  if (wallets[name]) {
    return true;
  } else {
    return false;
  }
}

function getWalletAddressFromName(name) {
  const wallets = getWallets();

  return wallets[name].publicKey;
}

function getWalletByPrivateKey(privateKey) {
  const wallets = getWallets();
  for (wallet in wallets) {
    if (wallets[wallet].privateKey == privateKey) {
      return wallets[wallet];
    }
  }
  return null;
}

module.exports = {
  getBlockchain: getBlockchain,
  getTransactions: getTransactions,
  writeBlockchain: writeBlockchain,
  writeTransactions: writeTransactions,
  getWallets: getWallets,
  writeWallets: writeWallets,
  getWalletAddressFromName: getWalletAddressFromName,
  checkWalletExistByName: checkWalletExistByName,
  getWalletByPrivateKey: getWalletByPrivateKey,
  getTransactionsPool: getTransactionsPool,
  writeTransactionsPool: writeTransactionsPool,
  updateWallet: updateWallet,
};

// Testing The function's are working or not

// const transaction = getTransactions();
// let blockchain = getBlockchain();

// let newTransaction = {
//   buyerAddress: null,
//   sellerAddress: "ASD",
//   price: 40,
// };

// transaction.push(newTransaction);
// writeTransactions(transaction);

// const transactions = getTransactions();

// let newBlock = {
//   nonce: 0,
//   hash: "NEW HASH",
//   previousHash: "PREV HASH",
//   transactions,
// };

// blockchain.push(newBlock);
// writeBlockchain(blockchain);
