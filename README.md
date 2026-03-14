# HD Wallet Visualization

A modern, interactive tool for visualizing the hierarchical deterministic (HD) wallet derivation process. This application breaks down the complex flow of creating Bitcoin and EVM-compatible wallets from entropy to final addresses.

## Features

- **Entropy & Mnemonic**: Visualize the relationship between raw entropy, checksums, and BIP-39 mnemonic phrases.
- **Seed Generation**: Follow the derivation of the 512-bit seed from the mnemonic and optional passphrase.
- **Hierarchical Derivation**: Explore the step-by-step derivation of Master Keys, Purpose, Coin Types, Accounts, and Chains.
- **Index & Address**: View multiple derived addresses with their corresponding private and public keys.
- **Interactive Flow**: A beautiful, horizontally scrolling interface designed for clear conceptual understanding.
- **Security First**: All calculations are performed locally in your browser. No data is ever sent to a server.

## Technical Stack

- **React**: Modern UI components and state management.
- **Vite**: Ultra-fast development and build tooling.
- **bitcoinjs-lib**: Robust library for Bitcoin-specific operations.
- **bip32 / bip39**: Industry-standard libraries for HD wallet logic.
- **Vanilla CSS**: Premium, custom-crafted aesthetics without the weight of large frameworks.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (installed automatically with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hd-wallet-visualization.git
   cd hd-wallet-visualization
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Open Source

This project is free and open-source software. You are encouraged to explore the code, suggest improvements, and adapt it for your own educational needs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
