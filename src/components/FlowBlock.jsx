import React from 'react';

const FlowBlock = ({ title, children, showTooltip = true, onTooltipClick, isActive = true, onInactiveClick, transparent = false }) => {
  return (
    <div 
      className={`flow-step ${!isActive ? 'inactive' : ''} ${transparent ? 'transparent-block' : ''}`}
      onClick={!isActive ? onInactiveClick : undefined}
    >
      <div className="step-header">
        <h3>{title}</h3>
        {showTooltip && (
          <button className="tooltip-trigger" onClick={onTooltipClick}>
            <i>i</i>
          </button>
        )}
      </div>
      <div className="step-content">
        {children}
      </div>
    </div>
  );
};

export default FlowBlock;
