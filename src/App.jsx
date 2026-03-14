import React, { useState, useEffect, useRef } from 'react';
import FlowBlock from './components/FlowBlock';
import EntropyStep from './components/EntropyStep';
import MnemonicStep from './components/MnemonicStep';
import SeedStep from './components/SeedStep';
import MasterKeyStep from './components/MasterKeyStep';
import PurposeStep from './components/PurposeStep';
import CoinStep from './components/CoinStep';
import AccountStep from './components/AccountStep';
import ChainStep from './components/ChainStep';
import TripletView from './components/TripletView';
import FlowArrow from './components/FlowArrow';
import ProgressBar from './components/ProgressBar';
import * as hdLogic from './logic/hd-wallet';
import { Buffer } from 'buffer';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [strength, setStrength] = useState(128);
  const [mnemonic, setMnemonic] = useState('');
  const [entropy, setEntropy] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [seed, setSeed] = useState('');
  const [masterXprv, setMasterXprv] = useState('');
  const [masterNode, setMasterNode] = useState(null);

  // Derivation States
  const [purpose, setPurpose] = useState('84\'');
  const [coin, setCoin] = useState('0\'');
  const [account, setAccount] = useState('0\'');
  const [chain, setChain] = useState('0');
  const [index, setIndex] = useState('0');

  // Result States
  const [finalAddress, setFinalAddress] = useState('');
  const [finalPublicKey, setFinalPublicKey] = useState('');
  const [fullPath, setFullPath] = useState('');

  // Tooltip State
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Refs for scrolling
  const stepRefs = [
    useRef(null), // 0: Entropy & Mnemonic
    useRef(null), // 1: Seed
    useRef(null), // 2: Master & Purpose
    useRef(null), // 3: Coin
    useRef(null), // 4: Account
    useRef(null), // 5: Chain
    useRef(null), // 6: Index & Address (Compact)
    useRef(null), // 7: Index & Address (Full)
  ];

  const steps = [
    'ENTROPY & MNEMONIC',
    'SEED',
    'PURPOSE',
    'COIN',
    'ACCOUNT',
    'EXTERNAL / INTERNAL',
    'INDEX',
    'PUBLIC KEY & ADDRESS'
  ];

  const tooltipData = {
    'entropy': { title: 'Entropy', content: 'คือการสุ่มค่าตัวเลขพื้นฐาน (128/256 bit) เพื่อนำไปเข้ากระบวนการแฮช (SHA256) และแปลงเป็นรหัสคำที่มนุษย์อ่านได้ (Mnemonic) ยิ่ง bit สูง ความปลอดภัยยิ่งมากขึ้นแต่จำนวนคำจะมากขึ้นตาม' },
    'mnemonic': { title: 'Mnemonic Phrase', content: 'หรือ Seed Phrase คือชุดคำที่ใช้แทนค่า Entropy เพื่อให้มนุษย์สามารถจดจำหรือสำรองข้อมูลได้ง่ายขึ้น โดยใช้คำจากมาตรฐาน BIP39 (2,048 คำ) มาเป็นตัวตัดสิน' },
    'seed': { title: 'BIP39 Seed', content: 'เกิดจากการนำ Mnemonic และ Passphrase (ถ้ามี) ไปผ่านกระบวนการ PBKDF2 สองพันครั้ง เพื่อสร้าง Buffer 64-byte (512-bit) ที่จะใช้เป็นต้นกำเนิดของกุญแจทั้งหมด' },
    'masterKey': { title: 'Master Node', content: 'กุญแจหลัก (m) ที่เป็นรากฐานของทุกอย่างใน HD Wallet ตามมาตรฐาน BIP32 จากตรงนี้เราสามารถแตกกิ่งก้าน (Derivation) ออกไปเป็นกี่ล้าน Address ก็ได้' },
    'purpose': { title: 'Purpose', content: 'ระบุมาตรฐานการ Derivation: 44\' สำหรับ Legacy (1...), 49\' สำหรับ Nested SegWit (3...), 84\' สำหรับ Native SegWit (bc1q...) และ 86\' สำหรับ Taproot (bc1p...)' },
    'coin': { title: 'Coin Type', content: 'กำหนดชนิดของเหรียญตามมาตรฐาน SLIP-0044 เช่น Bitcoin (0\'), Bitcoin Testnet (1\'), Litecoin (2\'), Ethereum (60\')' },
    'account': { title: 'Account Index', content: 'เปรียบเหมือนการแยกสมุดบัญชีในธนาคารเดียวกัน ช่วยให้คุณสามารถแยกจัดการเงินก้อนต่างๆ ออกจากกันได้เพื่อความเป็นส่วนตัวหรือการแยกวัตถุประสงค์การใช้' },
    'chain': { title: 'Chain Index', content: '0 = External Chain (สำหรับรับเงินจากคนอื่น/แจกจ่าย Address), 1 = Internal Chain (สำหรับ Change Address ที่ระบบส่งเงินทอนกลับมาให้ตัวเอง)' },
    'index': { title: 'Address Index', content: 'ลำดับของ Address ย่อยภายใน Account และ Chain นั้นๆ เริ่มต้นจาก 0 และเพิ่มขึ้นไปได้เรื่อยๆ ทุกครั้งที่มีการใช้งาน Address ใหม่' },
    'address': { title: 'Final Address / Key', content: 'ผลลัพธ์สุดท้ายที่ได้จากการแปลง Public Key เป็นรูปแบบที่เครือข่ายเข้าใจ พร้อมใช้งานสำหรับการรับเงิน' }
  };

  const openTooltip = (key) => setActiveTooltip(tooltipData[key]);
  const closeTooltip = () => setActiveTooltip(null);

  // Initial generation
  useEffect(() => {
    handleGenerate();
  }, [strength]);

  const handleGenerate = (newStrength = strength) => {
    const newEntropyBin = Array.from({ length: newStrength }, () => Math.round(Math.random())).join('');
    setEntropy(newEntropyBin);
    const hex = hdLogic.binaryToHex(newEntropyBin);
    const newMnemonic = hdLogic.entropyToMnemonic(hex);
    setMnemonic(newMnemonic);
    setStrength(newStrength);
  };

  const handleEntropyChange = (newEntropy) => {
    setEntropy(newEntropy);
    if ((newEntropy.length === 128 || newEntropy.length === 256) && /^[01]+$/.test(newEntropy)) {
      const hex = hdLogic.binaryToHex(newEntropy);
      try {
        const mn = hdLogic.entropyToMnemonic(hex);
        setMnemonic(mn);
        setStrength(newEntropy.length);
      } catch (e) {
        console.error("Invalid entropy for mnemonic generation");
      }
    }
  };

  const handleMnemonicChange = (newMnemonic) => {
    setMnemonic(newMnemonic);
    // clean whitespace
    const cleanWordList = newMnemonic.trim().replace(/\s+/g, ' ');
    const wordCount = cleanWordList.split(' ').filter(Boolean).length;

    // Only attempt conversion if word count is valid bip39
    if ([12, 15, 18, 21, 24].includes(wordCount)) {
      const hex = hdLogic.mnemonicToEntropyHex(cleanWordList);
      if (hex) {
        const bin = hdLogic.hexToBinary(hex);
        setEntropy(bin);
        setStrength(bin.length);
      } else {
        setEntropy(''); // valid length but bad checksum/words
      }
    } else {
      setEntropy(''); // invalid length
    }
  };

  const isEntropyValid = (entropy.length === 128 || entropy.length === 256) && /^[01]+$/.test(entropy);
  const currentChecksum = isEntropyValid ? hdLogic.calculateChecksumBits(entropy) : '';

  useEffect(() => {
    const updateDerivation = async () => {
      // only proceed if we have a valid sequence
      if (mnemonic && isEntropyValid) {
        try {
          const seedBuffer = await hdLogic.mnemonicToSeed(mnemonic, passphrase);
          setSeed(seedBuffer.toString('hex'));

          const root = hdLogic.getMasterNode(seedBuffer);
          setMasterNode(root);
          setMasterXprv(root.toBase58());

          const path = `m/${purpose}/${coin}/${account}/${chain}/${index}`;
          setFullPath(path);

          const child = hdLogic.derivePath(root, path);
          setFinalPublicKey(child.publicKey.toString('hex'));

          const addr = hdLogic.getAddress(child.publicKey, purpose);
          setFinalAddress(addr);
        } catch (e) {
          console.error("Derivation error", e);
        }
      } else {
        // clear downstream states when invalid
        setSeed('');
        setMasterNode(null);
        setMasterXprv('');
        setFullPath('');
        setFinalPublicKey('');
        setFinalAddress('');
      }
    };
    updateDerivation();
  }, [mnemonic, passphrase, purpose, coin, account, chain, index, isEntropyValid]);

  const scrollToStepRef = (stepIndex) => {
    if (stepRefs[stepIndex] && stepRefs[stepIndex].current) {
      stepRefs[stepIndex].current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const scrollToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    scrollToStepRef(stepIndex);
  };

  const nextStep = () => {
    setCurrentStep(prev => {
      const nextIdx = Math.min(prev + 1, steps.length - 1);
      if (nextIdx !== prev) setTimeout(() => scrollToStepRef(nextIdx), 0);
      return nextIdx;
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => {
      const prevIdx = Math.max(prev - 1, 0);
      if (prevIdx !== prev) setTimeout(() => scrollToStepRef(prevIdx), 0);
      return prevIdx;
    });
  };

  const activeCardsByStep = [
    [0, 1], // Stage 1: Entropy & Mnemonic
    [2, 3], // Stage 2: Seed & Master Key
    [3, 4], // Stage 3: Master Key & Purpose
    [4, 5], // Stage 4: Coin (keep Purpose active)
    [5, 6], // Stage 6: Chain (Step 5)
    [6, 7], // Stage 7: Index & Address (Step 6)
    [7, 8], // Stage 8: Index & Address (Peeking Chain)
    [8]      // Stage 9: Final Address (Peeking Chain)
  ];

  const handleCardClick = (cardIndex) => {
    setCurrentStep(prev => {
      const activeIndices = activeCardsByStep[prev];
      const minActive = Math.min(...activeIndices);
      const maxActive = Math.max(...activeIndices);

      let nextIdx = prev;
      if (cardIndex < minActive) {
        nextIdx = Math.max(prev - 1, 0);
      } else if (cardIndex > maxActive) {
        nextIdx = Math.min(prev + 1, steps.length - 1);
      }

      if (nextIdx !== prev) setTimeout(() => scrollToStepRef(nextIdx), 0);
      return nextIdx;
    });
  };

  useEffect(() => {
    let timeout;
    let touchStartX = 0;

    const container = document.querySelector('.scroll-viewport');
    if (!container) return;

    const handleWheel = (e) => {
      if (e.target.closest('.scrollable-list') || e.target.closest('.vertical-snap-list') || e.target.closest('.triplet-viewport')) return;
      e.preventDefault();
      if (timeout) return;

      const threshold = 30;
      if (Math.abs(e.deltaY) > threshold || Math.abs(e.deltaX) > threshold) {
        if (e.deltaY > 0 || e.deltaX > 0) {
          nextStep();
        } else {
          prevStep();
        }
        timeout = setTimeout(() => { timeout = null; }, 600);
      }
    };

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (timeout) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchStartX - touchEndX;

      if (diffX > 50) {
        nextStep();
        timeout = setTimeout(() => { timeout = null; }, 600);
      } else if (diffX < -50) {
        prevStep();
        timeout = setTimeout(() => { timeout = null; }, 600);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="app-container">
      <header className="sticky-header">
        <h1>HD Wallet Visualization</h1>
        <ProgressBar currentStep={currentStep} steps={steps} onStepClick={scrollToStep} />
      </header>

      <div className="scroll-viewport">
        <main className="horizontal-flow continuous-flow">
          {/* Stage 1: Entropy & Mnemonic */}
          <div className="flow-wrapper">
            <FlowBlock
              title="Entropy"
              onTooltipClick={() => openTooltip('entropy')}
              isActive={activeCardsByStep[currentStep]?.includes(0)}
              onInactiveClick={() => handleCardClick(0)}
            >
              <EntropyStep
                entropy={entropy}
                onEntropyChange={handleEntropyChange}
                strength={strength}
                onStrengthChange={setStrength}
                onGenerate={handleGenerate}
                checksum={currentChecksum}
              />
            </FlowBlock>
          </div>

          {/* Ref 0: Centers Entropy & Mnemonic */}
          <FlowArrow ref={stepRefs[0]} onTooltipClick={() => openTooltip('entropy')} doubleHead={true} />

          <div className="flow-wrapper">
            <FlowBlock
              title="Mnemonic"
              onTooltipClick={() => openTooltip('mnemonic')}
              isActive={activeCardsByStep[currentStep]?.includes(1)}
              onInactiveClick={() => handleCardClick(1)}
            >
              <MnemonicStep
                mnemonic={mnemonic}
                onMnemonicChange={handleMnemonicChange}
                entropyBin={isEntropyValid ? entropy : ''}
                checksumBin={currentChecksum}
              />
            </FlowBlock>
          </div>

          {/* This arrow is skipped in the main navigation steps */}
          <FlowArrow onTooltipClick={() => openTooltip('mnemonic')} />

          {/* Stage 2: Seed */}
          <div className="flow-wrapper">
            <FlowBlock
              title="Seed / Passphrase"
              onTooltipClick={() => openTooltip('seed')}
              isActive={activeCardsByStep[currentStep]?.includes(2)}
              onInactiveClick={() => handleCardClick(2)}
            >
              <SeedStep
                seed={seed}
                passphrase={passphrase}
                onPassphraseChange={setPassphrase}
              />
            </FlowBlock>
          </div>

          {/* Ref 1: Centers Seed & Master Key */}
          <FlowArrow ref={stepRefs[1]} onTooltipClick={() => openTooltip('seed')} />

          {/* Stage 3: Master Key & Purpose */}
          <div className="flow-wrapper">
            <FlowBlock
              title="Master Root Key"
              onTooltipClick={() => openTooltip('masterKey')}
              isActive={activeCardsByStep[currentStep]?.includes(3)}
              onInactiveClick={() => handleCardClick(3)}
            >
              <MasterKeyStep masterXprv={masterXprv} />
            </FlowBlock>
          </div>

          {/* Ref 2: Centers Master Key & Purpose */}
          <FlowArrow ref={stepRefs[2]} onTooltipClick={() => openTooltip('masterKey')} />

          <div className="flow-wrapper purpose-wrapper">
            <FlowBlock
              title="Purpose"
              onTooltipClick={() => openTooltip('purpose')}
              isActive={activeCardsByStep[currentStep]?.includes(4)}
              onInactiveClick={() => handleCardClick(4)}
              transparent={true}
            >
              <PurposeStep
                selectedPurpose={purpose}
                onPurposeChange={setPurpose}
                masterNode={masterNode}
              />
            </FlowBlock>
          </div>

          {/* Ref 3: Centers Purpose & Coin */}
          <FlowArrow ref={stepRefs[3]} onTooltipClick={() => openTooltip('purpose')} />

          {/* Stage 4: Coin */}
          <div className="flow-wrapper purpose-wrapper">
            <FlowBlock
              title="Coin"
              onTooltipClick={() => openTooltip('coin')}
              isActive={activeCardsByStep[currentStep]?.includes(5)}
              onInactiveClick={() => handleCardClick(5)}
              transparent={true}
            >
              <CoinStep
                selectedCoin={coin}
                onCoinChange={setCoin}
                purpose={purpose}
                masterNode={masterNode}
              />
            </FlowBlock>
          </div>

          {/* Ref 4: Centers Coin & Account */}
          <FlowArrow ref={stepRefs[4]} onTooltipClick={() => openTooltip('coin')} />

          {/* Stage 5: Account */}
          <div className="flow-wrapper purpose-wrapper">
            <FlowBlock
              title="Account"
              onTooltipClick={() => openTooltip('account')}
              isActive={activeCardsByStep[currentStep]?.includes(6)}
              onInactiveClick={() => handleCardClick(6)}
              transparent={true}
            >
              <AccountStep
                selectedAccount={account}
                onAccountChange={setAccount}
                purpose={purpose}
                coin={coin}
                masterNode={masterNode}
              />
            </FlowBlock>
          </div>

          {/* Ref 5: Centers Account & Chain */}
          <FlowArrow ref={stepRefs[5]} onTooltipClick={() => openTooltip('account')} />

          {/* Stage 6: Chain */}
          <div className="flow-wrapper purpose-wrapper">
            <FlowBlock
              title="Chain"
              onTooltipClick={() => openTooltip('chain')}
              isActive={activeCardsByStep[currentStep]?.includes(7)}
              onInactiveClick={() => handleCardClick(7)}
              transparent={true}
            >
              <ChainStep
                selectedChain={chain}
                onChainChange={setChain}
                purpose={purpose}
                coin={coin}
                account={account}
                masterNode={masterNode}
              />
            </FlowBlock>
          </div>

          {/* Ref 5-6 connector arrow (Static, no scroll ref here) */}
          <FlowArrow onTooltipClick={() => openTooltip('chain')} />

          {/* Stage 7 & 8: Index & Address (Consolidated Triplet View) */}
          <div id="index-address-stage" className="flow-wrapper triplet-wrapper">
            {/* Anchors for Step 7 and Step 8 focus - placed higher to keep block header visible */}
            <div ref={stepRefs[6]} className="ref7-focus-anchor" style={{ top: '10%', left: '0%' }}></div>
            <div ref={stepRefs[7]} className="ref8-focus-anchor" style={{ top: '10%', left: '42%' }}></div>
            
            <FlowBlock
              title="Index & Address"
              onTooltipClick={() => openTooltip('index')}
              isActive={(currentStep === 6 || currentStep === 7) && activeCardsByStep[currentStep]?.includes(8)}
              onInactiveClick={() => handleCardClick(8)}
              transparent={true}
            >
              <TripletView
                selectedIndex={index}
                onIndexChange={setIndex}
                purpose={purpose}
                coin={coin}
                account={account}
                chain={chain}
                masterNode={masterNode}
              />
            </FlowBlock>
          </div>
        </main>
      </div>

      {/* Tooltip Modal Overlay */}
      {activeTooltip && (
        <div className="modal-overlay" onClick={closeTooltip}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeTooltip}>&times;</button>
            <h2 className="modal-title">{activeTooltip.title} Info</h2>
            <div className="modal-body">
              {activeTooltip.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
