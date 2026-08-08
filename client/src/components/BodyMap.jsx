import React from 'react';

const BodyMap = ({ selectedRegions, onRegionToggle }) => {
  const isSelected = (id) => selectedRegions.includes(id);

  const getStyle = (id) => ({
    fill: isSelected(id) ? 'rgba(239, 68, 68, 0.6)' : 'rgba(94, 234, 212, 0.1)',
    stroke: isSelected(id) ? '#ef4444' : '#5eead4',
    strokeWidth: 2,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Tap areas of discomfort</h3>
      <svg width="120" height="240" viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        {/* Head */}
        <circle id="head" cx="60" cy="25" r="15" style={getStyle('head')} onClick={() => onRegionToggle('head')} />
        
        {/* Torso/Chest */}
        <path id="chest" d="M 45 45 L 75 45 L 75 80 L 45 80 Z" style={getStyle('chest')} onClick={() => onRegionToggle('chest')} rx="5" />
        
        {/* Abdomen */}
        <path id="abdomen" d="M 45 85 L 75 85 L 70 120 L 50 120 Z" style={getStyle('abdomen')} onClick={() => onRegionToggle('abdomen')} />
        
        {/* Arms */}
        <rect id="left_arm" x="25" y="45" width="15" height="60" rx="7" style={getStyle('left_arm')} onClick={() => onRegionToggle('left_arm')} />
        <rect id="right_arm" x="80" y="45" width="15" height="60" rx="7" style={getStyle('right_arm')} onClick={() => onRegionToggle('right_arm')} />
        
        {/* Legs */}
        <rect id="left_leg" x="45" y="125" width="12" height="80" rx="6" style={getStyle('left_leg')} onClick={() => onRegionToggle('left_leg')} />
        <rect id="right_leg" x="63" y="125" width="12" height="80" rx="6" style={getStyle('right_leg')} onClick={() => onRegionToggle('right_leg')} />
      </svg>
      
      {selectedRegions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-[200px]">
          {selectedRegions.map(r => (
            <span key={r} className="px-2 py-1 bg-emergency/20 text-emergency text-[10px] rounded border border-emergency/30 uppercase font-bold">
              {r.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BodyMap;
