import React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const SearchLoadingState: React.FC = () => {
  return (
    <div className="search-loading-container">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="search-loading-row">
          <Skeleton type="circle" width={32} height={32} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Skeleton width="35%" height={14} />
              <Skeleton width="15%" height={14} />
              <Skeleton width="12%" height={14} />
            </div>
            <Skeleton width="60%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
};
