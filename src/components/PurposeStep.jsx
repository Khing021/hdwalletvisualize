import React, { useRef, useEffect } from 'react';
import { deriveNode, getNodeXprv } from '../logic/hd-wallet';

const PurposeStep = ({ selectedPurpose, onPurposeChange, masterNode }) => {
  const purposes = [
    { label: 'm/44\' (Legacy)', value: '44\'' },
    { label: 'm/49\' (Nested Segwit)', value: '49\'' },
    { label: 'm/84\' (Native Segwit)', value: '84\'' },
    { label: 'm/86\' (Taproot)', value: '86\'' },
  ];

  const containerRef = useRef(null);

  // Smooth scroll to selected item if it changes from outside or from click
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    const selectedItem = items.find(item => item.getAttribute('data-value') === selectedPurpose);
    
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
  }, [selectedPurpose]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Filter actual items, skip spacers
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    if (items.length === 0) return;

    const containerCenter = container.scrollTop + (container.clientHeight / 2);
    
    let closestValue = selectedPurpose;
    let minDistance = Infinity;
    
    items.forEach(child => {
      const childCenter = child.offsetTop + (child.clientHeight / 2);
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = child.getAttribute('data-value');
      }
    });

    if (closestValue && closestValue !== selectedPurpose && minDistance < 40) {
      onPurposeChange(closestValue);
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
  }, [selectedPurpose, onPurposeChange]);

  return (
    <div className="purpose-step vertical-snap-list" ref={containerRef}>
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
      {purposes.map((p) => {
        const derivedNode = masterNode ? deriveNode(masterNode, `m/${p.value}`) : null;
        const xprv = getNodeXprv(derivedNode);
        
        return (
          <div 
            key={p.value} 
            data-value={p.value}
            className={`snap-item ${selectedPurpose === p.value ? 'selected' : ''}`}
            onClick={() => onPurposeChange(p.value)}
          >
            <div className="item-label" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{p.label}</div>
            <div className="item-subtext hex-display" style={{ 
              fontSize: '0.8rem', 
              padding: '0.75rem', 
              marginTop: '0.5rem',
              opacity: 0.9
            }}>
              {xprv || 'Derivation purpose'}
            </div>
          </div>
        );
      })}
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
    </div>
  );
};

export default PurposeStep;
