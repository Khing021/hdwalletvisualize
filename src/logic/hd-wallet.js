import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

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

/**
 * Generates address from public key based on purpose.
 */
export const getAddress = (publicKey, purpose) => {
  let network = bitcoin.networks.bitcoin;
  // Ensure publicKey is a proper Buffer for bitcoinjs-lib compatibility
  const pubkey = Buffer.from(publicKey);

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
    return bitcoin.payments.p2tr({ internalPubkey: pubkey.slice(1, 33), network }).address;
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
