import React from 'react';

const AddressStep = ({ path, publicKey, address }) => {
  return (
    <div className="address-step">
      <div className="key-display-block">
        <label>Derivation Path</label>
        <div className="path-text">{path || 'Waiting for valid mnemonic phrase...'}</div>
      </div>

      <div className="key-display-block">
        <label>Public Key</label>
        <div className="hex-display small-text">
          {publicKey || 'Waiting for valid mnemonic phrase...'}
        </div>
      </div>

      <div className="key-display-block">
        <label>Address</label>
        <div className="address-box">
          {address || 'Waiting for valid mnemonic phrase...'}
        </div>
      </div>
    </div>
  );
};

export default AddressStep;
