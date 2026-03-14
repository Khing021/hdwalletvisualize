import React from 'react';

const EntropyStep = ({ entropy, onEntropyChange, onGenerate, strength, onStrengthChange, checksum }) => {
  const isBinary = /^[01]*$/.test(entropy);
  const isValid = entropy.length === strength && isBinary;

  return (
    <div className="entropy-step" style={{ minHeight: '445px' }}>
      <textarea
        className={`binary-display editable ${!isValid ? 'invalid' : ''}`}
        value={entropy}
        onChange={(e) => onEntropyChange(e.target.value.replace(/[^01]/g, ''))}
        rows={10}
        placeholder={`Enter ${strength} bits of 0s and 1s...`}
        style={{ width: '100%', resize: 'none', boxSizing: 'border-box' }}
      />
      
      <div className="entropy-stats">
        <span className={entropy.length !== strength ? "error-text" : "valid-text"}>
          {entropy.length} bits
        </span>
      </div>

      {!isValid && entropy.length > 0 && (
        <div className="error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Entropy ไม่ถูกต้อง ต้องเป็นเลขฐาน 2 ขนาด 128 bit หรือ 256 bit เท่านั้น
        </div>
      )}

      <div className="checksum-display" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', minHeight: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Checksum:</label>
        <span className="checksum-bits" style={{ fontFamily: 'monospace', color: '#f472b6', fontWeight: 'bold' }}>{isValid && checksum ? checksum : ''}</span>
      </div>
      
      <div className="control-group" style={{ marginTop: '1.5rem' }}>
        <button 
          className={strength === 128 ? 'active' : ''} 
          onClick={() => { onStrengthChange(128); onGenerate(128); }}
        >
          สุ่ม 128 bit
        </button>
        <button 
          className={strength === 256 ? 'active' : ''} 
          onClick={() => { onStrengthChange(256); onGenerate(256); }}
        >
          สุ่ม 256 bit
        </button>
      </div>
    </div>
  );
};

export default EntropyStep;
