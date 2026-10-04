import React from 'react';

interface SkeletonBaseProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export const SkeletonLine: React.FC<SkeletonBaseProps> = ({
  className = '',
  width = '100%',
  height = '14px',
  borderRadius = 'var(--radius-sm, 6px)',
  style,
}) => {
  return (
    <div
      className={`bis-skeleton-shimmer bis-skeleton-line ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bis-card-skeleton" role="status" aria-label="Loading content...">
          <div className="bis-card-skeleton-top">
            <SkeletonLine width="110px" height="22px" borderRadius="var(--radius-full, 9999px)" />
            <SkeletonLine width="65px" height="20px" borderRadius="var(--radius-full, 9999px)" />
          </div>
          <div className="bis-card-skeleton-title">
            <SkeletonLine width="80%" height="20px" />
          </div>
          <div className="bis-card-skeleton-desc">
            <SkeletonLine width="95%" height="13px" />
            <SkeletonLine width="75%" height="13px" style={{ marginTop: '6px' }} />
          </div>
          <div className="bis-card-skeleton-meta">
            <SkeletonLine width="130px" height="16px" />
            <SkeletonLine width="90px" height="16px" />
          </div>
          <div className="bis-card-skeleton-footer">
            <SkeletonLine width="100px" height="34px" borderRadius="var(--radius-md, 8px)" />
            <SkeletonLine width="120px" height="34px" borderRadius="var(--radius-md, 8px)" />
          </div>
        </div>
      ))}
    </>
  );
};

export const SearchSkeleton: React.FC = () => {
  return (
    <div className="bis-search-skeleton" role="status" aria-label="Loading search controls...">
      <div className="bis-search-bar-skeleton">
        <SkeletonLine width="100%" height="46px" borderRadius="var(--radius-lg, 12px)" />
      </div>
      <div className="bis-search-filters-skeleton">
        <SkeletonLine width="140px" height="36px" borderRadius="var(--radius-md, 8px)" />
        <SkeletonLine width="120px" height="36px" borderRadius="var(--radius-md, 8px)" />
        <SkeletonLine width="110px" height="36px" borderRadius="var(--radius-md, 8px)" />
        <SkeletonLine width="90px" height="36px" borderRadius="var(--radius-md, 8px)" />
      </div>
    </div>
  );
};

export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="bis-header-skeleton" role="status" aria-label="Loading header...">
      <SkeletonLine width="130px" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonLine width="320px" height="28px" style={{ marginBottom: '10px' }} />
      <SkeletonLine width="550px" height="16px" />
    </div>
  );
};

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="bis-list-skeleton" role="status" aria-label="Loading list...">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bis-list-skeleton-row">
          <SkeletonLine width="24px" height="24px" borderRadius="var(--radius-full, 9999px)" />
          <div className="bis-list-skeleton-content">
            <SkeletonLine width="65%" height="16px" style={{ marginBottom: '6px' }} />
            <SkeletonLine width="85%" height="13px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 4,
  columns = 4,
}) => {
  return (
    <div className="bis-table-skeleton-wrap" role="status" aria-label="Loading table...">
      <div className="bis-table-skeleton-head">
        {Array.from({ length: columns }).map((_, j) => (
          <SkeletonLine key={j} width="80%" height="16px" />
        ))}
      </div>
      <div className="bis-table-skeleton-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bis-table-skeleton-row">
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonLine key={j} width={j === 0 ? '90%' : '70%'} height="14px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContentSkeleton: React.FC = () => {
  return (
    <div className="bis-content-skeleton" role="status" aria-label="Loading details...">
      <HeaderSkeleton />
      <div className="bis-content-skeleton-grid" style={{ marginTop: '24px' }}>
        <SkeletonLine width="100%" height="180px" borderRadius="var(--radius-lg, 12px)" />
      </div>
      <div className="bis-content-skeleton-paragraphs" style={{ marginTop: '20px' }}>
        <SkeletonLine width="95%" height="14px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="98%" height="14px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="85%" height="14px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="60%" height="14px" />
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="bis-page-container bis-page-skeleton">
      <HeaderSkeleton />
      <div style={{ marginTop: '24px' }}>
        <SearchSkeleton />
      </div>
      <div className="bis-standards-grid" style={{ marginTop: '24px' }}>
        <CardSkeleton count={4} />
      </div>
    </div>
  );
};
