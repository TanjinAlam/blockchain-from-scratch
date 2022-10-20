const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const SHA256 = require("crypto-js/sha256");
let x = {
  id: "97b51f90-5032-11ed-8911-b5bd1925d22f",
  input: {
    timestamp: 1666241374237,
    amount: 500,
    address:
      "02ef0a421da70ff3dffef96c2407109462847a899ce934dd6bc44002566131f6fb",
    signature: {
      r: "b289ad69da26059acb2cf6842839ed1ac7580380f89726a2d82bb9b81a753af2",
      s: "4419f8081f9b78e529c4617accd75a729f23b4ac6b4d3d7f26938f353a375636",
      recoveryParam: 0,
    },
  },
  outputs: [
    {
      amount: 490,
      address:
        "02ef0a421da70ff3dffef96c2407109462847a899ce934dd6bc44002566131f6fb",
    },
    {
      amount: 10,
      address:
        "038265eafeea98cd809f512b233f4df59d38187aa8d4136759b03383bffdd8fb46",
    },
  ],
};
// let key = ec.keyFromPrivate(
//   "d0706936b305b325ea1837b7ee2be6b9f49153a04281e7bb49e3fe3ccf61cfb7"
// );
let key = ec.keyFromPublic(
  "02ef0a421da70ff3dffef96c2407109462847a899ce934dd6bc44002566131f6fb",
  "hex"
);

let hashMsg = SHA256(JSON.stringify(x.outputs)).toString();
// let signValue = ec.sign(hashMsg, privKey, "hex", {
//   canonical: true,
// });
let pubKey = key.getPublic();
// let key1 = ec.keyFromPublic(x.input.address, "hex");
// console.log(key1.getPublic());
// let key2 = ec.keyFromPublic(pubKey, "hex");
let key2 = ec.keyFromPublic(
  "02ef0a421da70ff3dffef96c2407109462847a899ce934dd6bc44002566131f6fb",
  "hex"
);
console.log(ec.verify(hashMsg, x.input.signature, key2));
