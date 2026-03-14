import React, { useRef, useEffect } from 'react';
import { deriveNode, getNodeXprv } from '../logic/hd-wallet';

const CoinStep = ({ selectedCoin, onCoinChange, purpose, masterNode }) => {
  const coins = [
    { label: 'Bitcoin', value: '0\'' },
    { label: 'Bitcoin Testnet', value: '1\'' },
    { label: 'Litecoin', value: '2\'' },
    { label: 'Dogecoin', value: '3\'' },
    { label: 'Bitcoin Cash', value: '145\'' },
    { label: 'BitcoinSV', value: '236\'' },
  ];

  const containerRef = useRef(null);

  // Smooth scroll to selected item if it changes from outside or from click
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Filter actual items, skip spacers
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    const selectedItem = items.find(item => item.getAttribute('data-value') === selectedCoin);
    
    if (selectedItem) {
      const containerH = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemH = selectedItem.clientHeight;
      // Calculate scroll position to center the item
      const targetScroll = itemTop - (containerH / 2) + (itemH / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [selectedCoin]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Filter actual items, skip spacers
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    if (items.length === 0) return;

    const containerCenter = container.scrollTop + (container.clientHeight / 2);
    
    let closestValue = selectedCoin;
    let minDistance = Infinity;
    
    items.forEach(child => {
      const childCenter = child.offsetTop + (child.clientHeight / 2);
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = child.getAttribute('data-value');
      }
    });

    if (closestValue && closestValue !== selectedCoin && minDistance < 40) {
      onCoinChange(closestValue);
    }
  };

  // Debounce the scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId;
    const onScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // 100ms debounce
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      clearTimeout(timeoutId);
    };
  }, [selectedCoin, onCoinChange]);

  return (
    <div className="coin-step vertical-snap-list" ref={containerRef}>
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
      {coins.map((c) => {
        const pathSuffix = `${purpose}/${c.value}`;
        const derivedNode = masterNode ? deriveNode(masterNode, `m/${pathSuffix}`) : null;
        const xprv = getNodeXprv(derivedNode);

        return (
          <div 
            key={c.value} 
            data-value={c.value}
            className={`snap-item ${selectedCoin === c.value ? 'selected' : ''}`}
            onClick={() => onCoinChange(c.value)}
          >
            <div className="item-label" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              m/{pathSuffix} ({c.label})
            </div>
            <div className="item-subtext hex-display" style={{ 
              fontSize: '0.8rem', 
              padding: '0.75rem', 
              marginTop: '0.5rem',
              opacity: 0.9
            }}>
              {xprv || 'Derivation coin key'}
            </div>
          </div>
        );
      })}
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
    </div>
  );
};

export default CoinStep;
