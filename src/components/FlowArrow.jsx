import React from 'react';

const FlowArrow = React.forwardRef(({ onTooltipClick, doubleHead = false }, ref) => {
  return (
    <div className="flow-connector" ref={ref}>
      {doubleHead && (
        <div 
          className="connector-arrow-left" 
          style={{ position: 'absolute', left: '-2px', width: '10px', height: '10px', borderBottom: '2px solid var(--accent-color)', borderLeft: '2px solid var(--accent-color)', transform: 'rotate(45deg)'}}
        ></div>
      )}
      <div className="connector-line"></div>
      <div className="connector-arrow"></div>
      <div className="connector-info" onClick={onTooltipClick}>
        <i>i</i>
      </div>
    </div>
  );
});

export default FlowArrow;
