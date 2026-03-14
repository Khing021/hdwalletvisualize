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
    // Card Tooltips (Data Objects)
    'entropy': { 
      title: 'Entropy', 
      content: 'คือตัวเลขขนาดใหญ่มาก ๆ ค่าหนึ่งซึ่งจะถูกนำไปคำนวณต่อเป็นชุด key และ address ของเราทั้งหมด<br><br>หากมีคนสองคนที่ใช้ค่า entropy เดียวกัน ก็จะได้ชุด key และ address เดียวกันและสามารถขโมยเงินของกันและกันได้ แต่เนื่องจากมาตรฐานกำหนดให้ใช้ entropy ที่ขนาดใหญ่มาก (128 - 256 bit) ทำให้โอกาสที่คนสองคนจะสุ่มได้ค่า entropy เดียวกันนั้นแทบจะเป็นไปไม่ได้ ราวกับการสุ่มหยิบอะตอมให้ได้อะตอมเดียวกันในจักรวาล หรือเทียบเท่าการถูกหวยรางวัลที่หนึ่งติดต่อกัน 7 - 12 งวดซ้อน<br><br>แม้ตามมาตรฐานจริงแล้ว entropy สามารถที่จะเป็น 128, 160, 192, 224, 256 bit ก็ได้ ซึ่งจะสร้างได้เป็น mnemonic phrase (seed phrase) ขนาด 12, 15, 18, 21, 24 คำตามลำดับ แต่ว่ามาตรฐานที่ใช้กันในวงกว้างมีเพียง 12 และ 24 คำเท่านั้น ซึ่งก็มีความปลอดภัยเพียงพอ<br><br>โดยที่ entropy จะถูกนำไปคำนวณหาตัวเลข checksum เพิ่มเติมอีก 4 bit (สำหรับ 128 bit) หรือ 8 bit (สำหรับ 256 bit) เพื่อนำไปต่อท้าย entropy เดิม เป็นมาตรการป้องกันการจดรหัสสำรองกระเป๋าผิดพลาด' 
    },
    'mnemonic': { 
      title: 'Mnemonic Phrase (BIP39)', 
      content: 'ชุดคำศัพท์ 12-24 คำที่ใช้แทนค่า Entropy เพื่อความสะดวกในการจดจำและสำรองข้อมูล' 
    },
    'seed': { 
      title: 'BIP39 Seed', 
      content: 'ข้อมูลดิบขนาด 512 บิตที่เป็นต้นกำเนิดของกุญแจทั้งหมดในกระเป๋า' 
    },
    'masterKey': { 
      title: 'Master Root Key (BIP32)', 
      content: 'กุญแจหลักที่เป็นรากฐานของการ Derivation ทั้งหมดในกระเป๋าเงิน' 
    },
    'purpose': { 
      title: 'Purpose (BIP44/49/84/86)', 
      content: 'การกำหนดมาตรฐานประเภทที่อยู่กระเป๋า (เช่น Legacy, Segwit, Taproot)' 
    },
    'coin': { 
      title: 'Coin Type (SLIP-0044)', 
      content: 'การเลือกชนิดเหรียญตามมาตรฐานสากล (เช่น 0\' สำหรับ Bitcoin)' 
    },
    'account': { 
      title: 'Account Index', 
      content: 'การแยกบัญชีผู้ใช้ภายในกระเป๋าเดียวกันเพื่อความเป็นส่วนตัว' 
    },
    'chain': { 
      title: 'Chain Index', 
      content: 'การแยกระหว่าง External (รับเงิน) และ Internal (เงินทอน/Change)' 
    },
    'index': { 
      title: 'Address Index', 
      content: 'ลำดับที่ของ Address ภายในบัญชีและ Chain นั้นๆ' 
    },

    // Arrow Tooltips (Mathematical Processes)
    'proc_entropy_mnemonic': {
      title: 'Checksum & Encoding',
      content: 'คำนวณ SHA256 (Checksum) ต่อท้าย Entropy และแบ่งเป็นกลุ่มละ 11 บิตเพื่อเทียบคำใน Wordlist'
    },
    'proc_mnemonic_seed': {
      title: 'PBKDF2 Key Stretching',
      content: 'นำ Mnemonic + Passphrase มาผ่านกระบวนการ PBKDF2 (HMAC-SHA512) วนซ้ำ 2048 ครั้ง'
    },
    'proc_seed_master': {
      title: 'Master Key Generation',
      content: 'นำ Seed มาผ่าน HMAC-SHA512 เพื่อสร้าง Root Private Key และ Chain Code'
    },
    'proc_hardened_derivation': {
      title: 'Hardened Derivation (BIP32)',
      content: 'การสร้างกุญแจลูกโดยใช้ Private Key ของตัวแม่ร่วมกับ Index ทำให้มีความปลอดภัยสูง (ไม่สามารถหาค่ากลับจาก Public Key ได้)'
    },
    'proc_normal_derivation': {
      title: 'Normal Derivation (BIP32)',
      content: 'การสร้างกุญแจลูกแบบปกติ ซึ่งสามารถคำนวณจาก Extended Public Key ของตัวแม่ได้เลย'
    },
    'proc_pubkey_derivation': {
      title: 'Elliptic Curve Math',
      content: 'การคำนวณ Public Key จาก Private Key โดยใช้การคูณจุดบนเส้นโค้ง secp256k1'
    },
    'proc_address_encoding': {
      title: 'Address Encoding',
      content: 'การแปลง Public Key เป็น Hash ตามมาตรฐานที่เลือก (เช่น P2PKH, P2WPKH) และเข้ารหัสเป็น Base58 หรือ Bech32'
    }
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
          <FlowArrow ref={stepRefs[0]} onTooltipClick={() => openTooltip('proc_entropy_mnemonic')} doubleHead={true} />

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
          <FlowArrow onTooltipClick={() => openTooltip('proc_entropy_mnemonic')} />

          {/* Stage 2: Seed */}
          <div className="flow-wrapper">
            <FlowBlock
              title="Passphrase & Seed"
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
          <FlowArrow ref={stepRefs[1]} onTooltipClick={() => openTooltip('proc_mnemonic_seed')} />

          {/* Stage 3: Master Key & Purpose */}
          <div className="flow-wrapper">
            <FlowBlock
              title="BIP32 Root Key"
              onTooltipClick={() => openTooltip('masterKey')}
              isActive={activeCardsByStep[currentStep]?.includes(3)}
              onInactiveClick={() => handleCardClick(3)}
            >
              <MasterKeyStep masterXprv={masterXprv} />
            </FlowBlock>
          </div>

          {/* Ref 2: Centers Master Key & Purpose */}
          <FlowArrow ref={stepRefs[2]} onTooltipClick={() => openTooltip('proc_seed_master')} />

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
          <FlowArrow ref={stepRefs[3]} onTooltipClick={() => openTooltip('proc_hardened_derivation')} />

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
          <FlowArrow ref={stepRefs[4]} onTooltipClick={() => openTooltip('proc_hardened_derivation')} />

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
          <FlowArrow ref={stepRefs[5]} onTooltipClick={() => openTooltip('proc_hardened_derivation')} />

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
          <FlowArrow onTooltipClick={() => openTooltip('proc_normal_derivation')} />

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
                onTooltipClick={openTooltip}
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
            <div 
              className="modal-body"
              dangerouslySetInnerHTML={{ __html: activeTooltip.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
