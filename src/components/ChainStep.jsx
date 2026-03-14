import React, { useRef, useEffect } from 'react';
import { deriveNode, getNodeXprv } from '../logic/hd-wallet';

const ChainStep = ({ selectedChain, onChainChange, purpose, coin, account, masterNode }) => {
  const chains = [
    { label: 'external', value: '0' },
    { label: 'internal', value: '1' },
  ];

  const containerRef = useRef(null);

  // Smooth scroll to selected item
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    const selectedItem = items.find(item => item.getAttribute('data-value') === selectedChain);
    
    if (selectedItem) {
      const containerH = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemH = selectedItem.clientHeight;
      const targetScroll = itemTop - (containerH / 2) + (itemH / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [selectedChain]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    if (items.length === 0) return;

    const containerCenter = container.scrollTop + (container.clientHeight / 2);
    
    let closestValue = selectedChain;
    let minDistance = Infinity;
    
    items.forEach(child => {
      const value = child.getAttribute('data-value');
      const childCenter = child.offsetTop + (child.clientHeight / 2);
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = value;
      }
    });

    if (closestValue && closestValue !== selectedChain && minDistance < 40) {
      onChainChange(closestValue);
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
  }, [selectedChain, onChainChange]);

  return (
    <div className="chain-step vertical-snap-list" ref={containerRef}>
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
      
      {chains.map((c) => {
        const pathSuffix = `${purpose}/${coin}/${account}/${c.value}`;
        const derivedNode = masterNode ? deriveNode(masterNode, `m/${pathSuffix}`) : null;
        const xprv = getNodeXprv(derivedNode);

        return (
          <div 
            key={c.value} 
            data-value={c.value}
            className={`snap-item ${selectedChain === c.value ? 'selected' : ''}`}
            onClick={() => onChainChange(c.value)}
          >
            <div className="item-label" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              m/{pathSuffix.replace(/'/g, "'")} ({c.label})
            </div>
            <div className="item-subtext hex-display" style={{ 
              fontSize: '0.8rem', 
              padding: '0.75rem', 
              marginTop: '0.5rem',
              opacity: 0.9
            }}>
              {xprv || 'Derivation chain key'}
            </div>
          </div>
        );
      })}

      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
    </div>
  );
};

export default ChainStep;
