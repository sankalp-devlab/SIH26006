import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'title' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  className = '',
  style = {},
}) => {
  let customStyle: React.CSSProperties = { ...style };
  if (width) customStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) customStyle.height = typeof height === 'number' ? `${height}px` : height;

  if (type === 'circle') {
    return <div className={`skeleton skeleton-circle ${className}`} style={customStyle} />;
  }

  if (type === 'title') {
    return (
      <div
        className={`skeleton skeleton-text ${className}`}
        style={{ height: '24px', width: width || '45%', ...customStyle }}
      />
    );
  }

  return (
    <div
      className={`skeleton skeleton-text ${className}`}
      style={{ height: height ? undefined : '14px', ...customStyle }}
    />
  );
};
