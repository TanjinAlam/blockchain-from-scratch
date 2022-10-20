import { getTransactions, writeTransactions } from "./blockchain-helpers.js.js";
import { getKnownPeerAddresses } from "./network-helpers.js";

import WebSocket, { WebSocketServer } from "ws";
import dotenv from "dotenv";
dotenv.config();

const knownPeers = getKnownPeerAddresses();
const MY_PORT = process.env.PORT;
const MY_ADDRESS = `ws://localhost:${MY_PORT}`;
const transactions = getTransactions();
const openedSockets = [];
const connectedAddresses = [];
const attemptingToConnectAddresses = [];
// Add your code below

const myServer = new WebSocketServer({ port: MY_PORT });

myServer.on("connection", (socket) => {
  console.log("connection established");
  socket.on("message", (dataString) => {
    console.log(`message received ${dataString}`);
    const message = JSON.parse(dataString);
    message.data.forEach((address) => connect(address));
  });
});

function connect(address) {
  if (
    address != MY_ADDRESS &&
    !attemptingToConnectAddresses.includes(address) &&
    !connectedAddresses.includes(address)
  ) {
    console.log(`attemping to connect to ${address}`);
    attemptingToConnectAddresses.push(address);

    const socket = new WebSocket(address);

    socket.on("open", () => {
      console.log(`onnection open ${address}`);
      attemptingToConnectAddresses.splice(
        attemptingToConnectAddresses.indexOf(address),
        1
      );
      connectedAddresses.push(address);
      socket.send(
        JSON.stringify({
          type: "HANDSHAKE",
          data: [MY_ADDRESS, ...connectedAddresses],
        })
      );
    });

    socket.on("error", () => {
      console.log(`error connecting to ${address}`);
      const index = attemptingToConnectAddresses.indexOf(address);
      if (index >= 0) {
        attemptingToConnectAddresses.splice(index, 1);
      }
    });
    socket.on("close", () => {
      console.log(`connection to ${address} closed`);
      connectedAddresses.splice(connectedAddresses.indexOf(address), 1);
    });
  }
}

knownPeers.forEach((peer) => connect(peer));
