import React from 'react';

const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`border border-green-400/30 flex flex-col bg-black/20 ${className}`}>
    <h2 className="text-center bg-green-400/10 py-1 font-bold tracking-widest uppercase text-2xl">{title}</h2>
    <div className="p-2 flex-grow overflow-hidden text-2xl leading-snug">
      {children}
    </div>
  </div>
);

export default Panel;
