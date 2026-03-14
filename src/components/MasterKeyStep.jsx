import React from 'react';

const MasterKeyStep = ({ masterXprv }) => {
  return (
    <div className="master-key-step" style={{ minHeight: '250px', display: 'flex', flexDirection: 'column' }}>
      <div className="key-display-block">
        <label>m (Master Private Key)</label>
        <div className="hex-display small-text">
          {masterXprv || 'Waiting for valid mnemonic phrase...'}
        </div>
      </div>
    </div>
  );
};

export default MasterKeyStep;
