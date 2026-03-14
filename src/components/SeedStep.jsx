import React from 'react';

const SeedStep = ({ seed, passphrase, onPassphraseChange }) => {
  return (
    <div className="seed-step" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column' }}>
      <div className="passphrase-input-container">
        <label>Passphrase (optional)</label>
        <input 
          type="text" 
          value={passphrase} 
          onChange={(e) => onPassphraseChange(e.target.value)}
          placeholder="enter passphrase here"
        />
      </div>
      
      <div className="seed-display">
        <label>BIP39 seed</label>
        <div className="hex-display">
          {seed || 'Waiting for valid mnemonic phrase...'}
        </div>
      </div>
    </div>
  );
};

export default SeedStep;
