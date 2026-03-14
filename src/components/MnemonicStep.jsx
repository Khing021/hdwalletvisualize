import React from 'react';

const MnemonicStep = ({ mnemonic, onMnemonicChange, entropyBin, checksumBin }) => {
  const renderChunks = () => {
    if (!entropyBin || !checksumBin) return <span style={{color: 'var(--text-dim)'}}>Waiting for valid entropy...</span>;
    const binaryString = entropyBin + checksumBin;
    const chunks = binaryString.match(/.{1,11}/g) || [];
    
    let renderedBits = 0;
    return chunks.map((c, i) => {
      const rendered = [];
      for(let j=0; j<c.length; j++) {
         const bitIndex = renderedBits + j;
         const isChecksum = bitIndex >= entropyBin.length;
         rendered.push(<span key={j} style={{ color: isChecksum ? '#f472b6' : 'inherit' }}>{c[j]}</span>);
      }
      renderedBits += c.length;
      return (
        <span key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px', color: 'var(--accent-color)' }}>
          {rendered}
        </span>
      );
    });
  };

  return (
    <div className="mnemonic-step" style={{ minHeight: '445px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', minHeight: '60px' }}>
        {renderChunks()}
      </div>
      <p className="description-label" style={{ marginBottom: '0.5rem' }}>Mnemonic Phrase (Seed Phrase)</p>
      <textarea
        className="binary-display editable"
        value={mnemonic}
        onChange={(e) => onMnemonicChange(e.target.value)}
        rows={10}
        style={{ width: '100%', resize: 'none', boxSizing: 'border-box' }}
        placeholder="Enter 12 or 24 words..."
      />
    </div>
  );
};

export default MnemonicStep;
