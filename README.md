# HD Wallet Visualization

[ภาษาไทย](#ภาษาไทย) | [English](#english)

---

## ภาษาไทย

เครื่องมือแบบโต้ตอบที่ทันสมัยสำหรับแสดงขั้นตอนการหาค่า (Derivation) ของ Hierarchical Deterministic (HD) Wallet แอปพลิเคชันนี้จะแยกย่อยขั้นตอนที่ซับซ้อนในการสร้างกระเป๋าเงินดิจิทัลที่รองรับ Bitcoin และ EVM ตั้งแต่ค่า Entropy เริ่มต้นไปจนถึงที่อยู่กระเป๋า (Address) สุดท้าย

### คุณสมบัติหลัก

- **Entropy & Mnemonic**: แสดงความสัมพันธ์ระหว่างค่า Entropy ดิบ, Checksum และวลี Mnemonic ตามมาตรฐาน BIP-39
- **การสร้าง Seed**: ติดตามการหาค่า Seed ขนาด 512 บิตจาก Mnemonic และ Passphrase (ถ้ามี)
- **การลำดับขั้น (Hierarchical Derivation)**: สำรวจการหาค่าทีละขั้นตอนตั้งแต่ Master Keys, Purpose, Coin Types, Accounts และ Chains
- **ที่อยู่และกุญแจ (Index & Address)**: แสดงที่อยู่กระเป๋าหลายรายการพร้อมกับกุญแจส่วนตัว (Private Key) และกุญแจสาธารณะ (Public Key) ที่เกี่ยวข้อง
- **อินเตอร์เฟซที่โต้ตอบได้**: ออกแบบมาให้เลื่อนในแนวนอนอย่างสวยงาม เพื่อความเข้าใจเชิงแนวคิดที่ชัดเจน
- **ความปลอดภัยเป็นอันดับหนึ่ง**: การคำนวณทั้งหมดเกิดขึ้นภายในบราวเซอร์ของคุณเอง ไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์

### เทคโนโลยีที่ใช้

- **React**: ส่วนประกอบ UI ที่ทันสมัยและการจัดการสถานะ
- **Vite**: เครื่องมือสำหรับการพัฒนาและ Build ที่รวดเร็วเป็นพิเศษ
- **bitcoinjs-lib**: ไลบรารีที่แข็งแกร่งสำหรับการดำเนินการเฉพาะของ Bitcoin
- **bip32 / bip39**: ไลบรารีมาตรฐานอุตสาหกรรมสำหรับตรรกะ HD Wallet
- **Vanilla CSS**: ดีไซน์พรีเมียมที่ปรับแต่งมาโดยเฉพาะ โดยไม่ต้องพึ่งพา Framework ขนาดใหญ่

### การเริ่มต้นใช้งาน

#### สิ่งที่จำเป็นต้องมี

- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- npm (ติดตั้งมาพร้อมกับ Node.js)

#### การติดตั้ง

1. คลอน Repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hd-wallet-visualization.git
   cd hd-wallet-visualization
   ```

2. ติดตั้ง Dependency:
   ```bash
   npm install
   ```

3. เริ่มเซิร์ฟเวอร์สำหรับพัฒนา:
   ```bash
   npm run dev
   ```

### โอเพนซอร์ส

โปรเจกต์นี้เป็นซอฟต์แวร์เสรีและโอเพนซอร์ส เราสนับสนุนให้คุณศึกษาโค้ด เสนอแนะการปรับปรุง หรือนำไปปรับใช้เพื่อการศึกษาของคุณเอง

### ใบอนุญาต

โปรเจกต์นี้ใช้ใบอนุญาต MIT License - ดูรายละเอียดเพิ่มเติมได้ที่ไฟล์ [LICENSE](LICENSE)

---

## English

A modern, interactive tool for visualizing the hierarchical deterministic (HD) wallet derivation process. This application breaks down the complex flow of creating Bitcoin and EVM-compatible wallets from entropy to final addresses.

### Features

- **Entropy & Mnemonic**: Visualize the relationship between raw entropy, checksums, and BIP-39 mnemonic phrases.
- **Seed Generation**: Follow the derivation of the 512-bit seed from the mnemonic and optional passphrase.
- **Hierarchical Derivation**: Explore the step-by-step derivation of Master Keys, Purpose, Coin Types, Accounts, and Chains.
- **Index & Address**: View multiple derived addresses with their corresponding private and public keys.
- **Interactive Flow**: A beautiful, horizontally scrolling interface designed for clear conceptual understanding.
- **Security First**: All calculations are performed locally in your browser. No data is ever sent to a server.

### Technical Stack

- **React**: Modern UI components and state management.
- **Vite**: Ultra-fast development and build tooling.
- **bitcoinjs-lib**: Robust library for Bitcoin-specific operations.
- **bip32 / bip39**: Industry-standard libraries for HD wallet logic.
- **Vanilla CSS**: Premium, custom-crafted aesthetics without the weight of large frameworks.

### Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (installed automatically with Node.js)

#### Installation

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

### Open Source

This project is free and open-source software. You are encouraged to explore the code, suggest improvements, and adapt it for your own educational needs.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
