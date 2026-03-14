import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);

/**
 * Utility functions for binary/hex conversion
 */
export const binaryToHex = (binaryStr) => {
  if (!/^[01]+$/.test(binaryStr)) return '';
  let hexStr = '';
  for (let i = 0; i < binaryStr.length; i += 4) {
    hexStr += parseInt(binaryStr.substr(i, 4), 2).toString(16);
  }
  return hexStr;
};

export const hexToBinary = (hexStr) => {
  let binaryStr = '';
  for (let i = 0; i < hexStr.length; i++) {
    binaryStr += parseInt(hexStr[i], 16).toString(2).padStart(4, '0');
  }
  return binaryStr;
};

/**
 * Calculates the checksum bits for a given binary entropy string
 */
export const calculateChecksumBits = (entropyBin) => {
  if (entropyBin.length !== 128 && entropyBin.length !== 256) return '';
  const hexStr = binaryToHex(entropyBin);
  const buffer = Buffer.from(hexStr, 'hex');
  const hash = bitcoin.crypto.sha256(buffer);
  const hashBin = hash[0].toString(2).padStart(8, '0');
  const checksumLength = entropyBin.length / 32;
  return hashBin.slice(0, checksumLength);
};

export const entropyToMnemonic = (entropyHex) => {
  return bip39.entropyToMnemonic(entropyHex);
};

export const mnemonicToEntropyHex = (mnemonicWordList) => {
  try {
    return bip39.mnemonicToEntropy(mnemonicWordList);
  } catch (e) {
    return null; // Invalid mnemonic
  }
};

/**
 * Generates a random mnemonic based on entropy strength (128 or 256 bits).
 */
export const generateMnemonic = (strength = 128) => {
  return bip39.generateMnemonic(strength);
};

/**
 * Converts mnemonic to seed buffer.
 */
export const mnemonicToSeed = async (mnemonic, passphrase = '') => {
  return await bip39.mnemonicToSeed(mnemonic, passphrase);
};

/**
 * Gets master node from seed.
 */
export const getMasterNode = (seedBuffer) => {
  return bip32.fromSeed(seedBuffer);
};

/**
 * Derives a path from a node.
 */
export const derivePath = (node, path) => {
  return node.derivePath(path);
};

const NETWORKS = {
  "0'": bitcoin.networks.bitcoin,
  "1'": bitcoin.networks.testnet,
  "2'": {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: { public: 0x019da462, private: 0x019d9cfe },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
  },
  "3'": {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bip32: { public: 0x02facafd, private: 0x02fac398 },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
  },
  "145'": bitcoin.networks.bitcoin, // BCH Legacy
  "236'": bitcoin.networks.bitcoin, // BSV Legacy
};

const COMPATIBILITY = {
  "0'": ["44'", "49'", "84'", "86'"],
  "1'": ["44'", "49'", "84'", "86'"],
  "2'": ["44'", "49'", "84'", "86'"],
  "3'": ["44'"],
  "145'": ["44'"],
  "236'": ["44'"],
};

const COIN_NAMES = {
  "0'": "Bitcoin",
  "1'": "Bitcoin Testnet",
  "2'": "Litecoin",
  "3'": "Dogecoin",
  "145'": "Bitcoin Cash",
  "236'": "BitcoinSV",
};

const PURPOSE_NAMES = {
  "44'": "Legacy",
  "49'": "Nested Segwit",
  "84'": "Native Segwit",
  "86'": "Taproot",
};

/**
 * Generates address from public key based on purpose and coin.
 */
export const getAddress = (publicKey, purpose, coin) => {
  if (!COMPATIBILITY[coin]?.includes(purpose)) {
    return `ERROR: ${COIN_NAMES[coin] || coin} ไม่รองรับแอดเดรสประเภท ${PURPOSE_NAMES[purpose] || purpose}`;
  }

  const network = NETWORKS[coin] || bitcoin.networks.bitcoin;
  const pubkey = Buffer.from(publicKey);

  try {
    if (purpose === "44'") {
      return bitcoin.payments.p2pkh({ pubkey, network }).address;
    } else if (purpose === "49'") {
      return bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({ pubkey, network }),
        network
      }).address;
    } else if (purpose === "84'") {
      return bitcoin.payments.p2wpkh({ pubkey, network }).address;
    } else if (purpose === "86'") {
      // Taproot uses X-only pubkey (32 bytes)
      return bitcoin.payments.p2tr({ internalPubkey: pubkey.slice(1, 33), network }).address;
    }
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
  return 'Unknown';
};
/**
 * Derives a node from a root node and path.
 */
export const deriveNode = (rootNode, path) => {
  try {
    return rootNode.derivePath(path);
  } catch (e) {
    return null;
  }
};

/**
 * Gets the base58 xprv string from a node.
 */
export const getNodeXprv = (node) => {
  return node ? node.toBase58() : '';
};
