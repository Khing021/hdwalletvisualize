import React, { useRef, useEffect, useState } from 'react';
import { deriveNode, getNodeXprv } from '../logic/hd-wallet';

const AccountStep = ({ selectedAccount, onAccountChange, purpose, coin, masterNode }) => {
  const [accountCount, setAccountCount] = useState(20);
  
  const accounts = Array.from({ length: accountCount }, (_, i) => ({
    label: `account #${i}`,
    value: `${i}'`
  }));

  const containerRef = useRef(null);
  const skipSmoothScrollRef = useRef(false);

  // Smooth scroll to selected item
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    const selectedItem = items.find(item => item.getAttribute('data-value') === selectedAccount);
    
    if (selectedItem) {
      const containerH = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemH = selectedItem.clientHeight;
      const targetScroll = itemTop - (containerH / 2) + (itemH / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: skipSmoothScrollRef.current ? 'auto' : 'smooth'
      });
      // Reset after use
      skipSmoothScrollRef.current = false;
    }
  }, [selectedAccount, accountCount]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const items = Array.from(container.children).filter(el => el.classList.contains('snap-item'));
    if (items.length === 0) return;

    const containerCenter = container.scrollTop + (container.clientHeight / 2);
    
    let closestValue = selectedAccount;
    let minDistance = Infinity;
    
    items.forEach(child => {
      const value = child.getAttribute('data-value');
      if (!value) return; // Skip "Add Account" button if it doesn't have a value

      const childCenter = child.offsetTop + (child.clientHeight / 2);
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestValue = value;
      }
    });

    if (closestValue && closestValue !== selectedAccount && minDistance < 40) {
      onAccountChange(closestValue);
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
  }, [selectedAccount, onAccountChange]);

  const handleAddAccounts = (e) => {
    e.stopPropagation();
    const firstNewIndex = accountCount;
    setAccountCount(prev => prev + 5);
    // Auto-select the first newly created account to push the button down
    skipSmoothScrollRef.current = true;
    onAccountChange(`${firstNewIndex}'`);
  };

  return (
    <div className="account-step vertical-snap-list" ref={containerRef}>
      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
      
      {accounts.map((a) => {
        const pathSuffix = `${purpose}/${coin}/${a.value}`;
        const derivedNode = masterNode ? deriveNode(masterNode, `m/${pathSuffix}`) : null;
        const xprv = getNodeXprv(derivedNode);

        return (
          <div 
            key={a.value} 
            data-value={a.value}
            className={`snap-item ${selectedAccount === a.value ? 'selected' : ''}`}
            onClick={() => onAccountChange(a.value)}
          >
            <div className="item-label" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              m/{pathSuffix.replace(/'/g, "'")} ({a.label})
            </div>
            <div className="item-subtext hex-display" style={{ 
              fontSize: '0.8rem', 
              padding: '0.75rem', 
              marginTop: '0.5rem',
              opacity: 0.9
            }}>
              {xprv || 'Derivation account key'}
            </div>
          </div>
        );
      })}

      {/* Add Account Button Card */}
      <div 
        className="snap-item" 
        onClick={handleAddAccounts}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderStyle: 'dashed',
          borderColor: 'var(--accent-color)',
          opacity: 0.6,
          minHeight: '120px'
        }}
      >
        <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.4rem' }}>
          + Add Account
        </div>
      </div>

      <div className="spacer-item" style={{ height: '200px', flexShrink: 0 }}></div>
    </div>
  );
};

export default AccountStep;
