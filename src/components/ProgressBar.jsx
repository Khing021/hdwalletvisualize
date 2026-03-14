import React from 'react';

const ProgressBar = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar-wrapper">
        {steps.map((step, index) => (
          <button 
            key={index} 
            className={`progress-step-item ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            onClick={() => onStepClick && onStepClick(index)}
          >
            <div className="step-circle">{index + 1}</div>
            <div className="step-label">{step}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
