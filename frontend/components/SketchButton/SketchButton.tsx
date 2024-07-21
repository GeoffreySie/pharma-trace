import React from 'react';

interface SketchButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const SketchButton: React.FC<SketchButtonProps> = ({ onClick, children }) => {
  return (
    <button
      className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default SketchButton;