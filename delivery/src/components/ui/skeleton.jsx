import React from 'react';

export function Skeleton({ className, style }) {
  return (
    <div 
      className={`skeleton ${className || ''}`} 
      style={style}
    />
  );
}

export function SkeletonCircle({ size = 40, className }) {
  return (
    <Skeleton 
      className={className}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
}
