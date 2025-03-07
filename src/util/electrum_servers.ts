export type ValidBchNetwork = "mainnet" | "chipnet" | "testnet3" | "testnet4";

const mainnet_servers = [
  "cashnode.bch.ninja", // Kallisti
  "fulcrum.jettscythe.xyz", // Jett
  "bch.imaginary.cash", // im_uname
  "bitcoincash.network", // Dagur
  "electroncash.dk", // Georg
  "bch.loping.net",
  "bch.soul-dev.com",
  "bitcoincash.stackwallet.com", // Rehrar / Stack Wallet official
  "blackie.c3-soft.com", // Calin's back!
  "node.minisatoshi.cash", // minisatoshi
];

const chipnet_servers = [
  "chipnet.bch.ninja", // Kallisti
  "chipnet.imaginary.cash", // im_uname
  "cbch.loping.net",
];

const testnet3_servers = ["blackie.c3-soft.com"];

const testnet4_servers = ["tbch4.loping.net", "testnet4.imaginary.cash"];

export const electrum_servers = {
  mainnet: mainnet_servers,
  chipnet: chipnet_servers,
  testnet3: testnet3_servers,
  testnet4: testnet4_servers,
};
