import React, { useRef, useEffect, useState } from 'react';
import { deriveNode, getNodeXprv, getAddress } from '../logic/hd-wallet';
import { Buffer } from 'buffer';

const TripletView = ({ selectedIndex, onIndexChange, purpose, coin, account, chain, masterNode, onTooltipClick }) => {
  const [indexCount, setIndexCount] = useState(20);
  const skipSmoothScrollRef = useRef(false);
  const containerRef = useRef(null);

  const indices = Array.from({ length: indexCount }, (_, i) => ({
    label: `#${i}`,
    value: `${i}`
  }));

  // Smooth scroll to selected item
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('triplet-row'));
    const selectedItem = items.find(item => item.getAttribute('data-value') === selectedIndex);

    if (selectedItem) {
      const containerH = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemH = selectedItem.clientHeight;
      const targetScroll = itemTop - (containerH / 2) + (itemH / 2);

      container.scrollTo({
        top: targetScroll,
        behavior: skipSmoothScrollRef.current ? 'auto' : 'smooth'
      });
      skipSmoothScrollRef.current = false;
    }
  }, [selectedIndex, indexCount]);

  // Scroll snap detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('triplet-row'));
    if (items.length === 0) return;

    const containerCenter = container.scrollTop + (container.clientHeight / 2);

    let closestValue = selectedIndex;
    let minDistance = Infinity;

    items.forEach(child => {
      const value = child.getAttribute('data-value');
      if (!value) return;

      const childCenter = child.offsetTop + (child.clientHeight / 2);
      const distance = Math.abs(containerCenter - childCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestValue = value;
      }
    });

    if (closestValue && closestValue !== selectedIndex && minDistance < 60) {
      onIndexChange(closestValue);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId;
    const onScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      clearTimeout(timeoutId);
    };
  }, [selectedIndex, onIndexChange]);

  const handleAddIndices = (e) => {
    e.stopPropagation();
    const firstNewIndex = indexCount;
    setIndexCount(prev => prev + 5);
    skipSmoothScrollRef.current = true;
    onIndexChange(`${firstNewIndex}`);
  };

  return (
    <div className="triplet-viewport" ref={containerRef}>
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>

      {indices.map((idx) => {
        const pathSuffix = `${purpose}/${coin}/${account}/${chain}/${idx.value}`;
        const fullPath = `m/${pathSuffix}`;
        let xprv = '';
        let pubKey = '';
        let addr = '';

        try {
          if (masterNode) {
            const derivedNode = deriveNode(masterNode, fullPath);
            if (derivedNode) {
              xprv = getNodeXprv(derivedNode);
              // Use Buffer.from for hex display
              pubKey = Buffer.from(derivedNode.publicKey).toString('hex');
              try {
                // Pass the original publicKey to getAddress (not Buffer-wrapped)
                addr = getAddress(derivedNode.publicKey, purpose, coin);
              } catch (addrErr) {
                addr = 'Error: ' + (addrErr.message || 'Unknown');
              }
            }
          }
        } catch (e) {
          // Derivation failed for this index, show placeholders
        }

        return (
          <div
            key={idx.value}
            data-value={idx.value}
            className={`triplet-row ${selectedIndex === idx.value ? 'selected' : ''}`}
            onClick={() => onIndexChange(idx.value)}
          >
            {/* Private Key Card */}
            <div className="triplet-card">
              <div className="triplet-card-label">m/{pathSuffix} (private key #{idx.value})</div>
              <div className="triplet-card-value">{xprv || '...'}</div>
            </div>

            {/* Arrow */}
            <div className="triplet-arrow" onClick={() => onTooltipClick('proc_pubkey_derivation')}>⇒</div>

            {/* Public Key Card */}
            <div className="triplet-card">
              <div className="triplet-card-label">M/{pathSuffix} (public key #{idx.value})</div>
              <div className="triplet-card-value">{pubKey || '...'}</div>
            </div>

            {/* Arrow */}
            <div className="triplet-arrow" onClick={() => onTooltipClick('proc_address_encoding')}>⇒</div>

            {/* Address Card */}
            <div className="triplet-card triplet-card-address">
              <div className="triplet-card-label">address #{idx.value}</div>
              <div className={`triplet-card-value ${addr?.startsWith('ERROR:') ? 'error-text small-text' : 'address-highlight'}`}>
                {addr || '...'}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Address Button */}
      <div
        className="triplet-row triplet-add-btn"
        onClick={handleAddIndices}
      >
        <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.4rem' }}>
          + Add Address
        </div>
      </div>

      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
    </div>
  );
};

export default TripletView;
