import React, { useState } from 'react';
import { ChecklistItem } from '../../types/compliance';
import { Badge } from '../common/Badge';

export interface ComplianceChecklistProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({
  items,
  onToggleItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((i) => i.category === selectedCategory);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bis-checklist-container">
      {/* Progress Bar & Header */}
      <div className="bis-checklist-header">
        <div>
          <h3 className="bis-checklist-title">My Compliance Checklist</h3>
          <p className="bis-checklist-subtitle">
            Track statutory documentation, in-house lab readiness, testing, and BIS portal requirements.
          </p>
        </div>

        <div className="bis-checklist-progress-stat">
          <div className="bis-progress-num">
            <strong>{completedCount}</strong> / {totalCount}
            <span className="bis-progress-pct">({progressPct}%)</span>
          </div>
          <div className="bis-progress-bar-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bis-progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="bis-category-pills-row" role="tablist" aria-label="Checklist Categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`bis-category-pill ${selectedCategory === cat ? 'bis-category-pill--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
            role="tab"
            aria-selected={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="bis-checklist-items-list">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bis-checklist-item ${item.completed ? 'bis-checklist-item--completed' : ''}`}
            onClick={() => onToggleItem(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onToggleItem(item.id);
              }
            }}
          >
            <div className="bis-checkbox-col">
              <input
                type="checkbox"
                id={`chk-${item.id}`}
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="bis-checkbox-input"
                aria-label={item.title}
              />
            </div>

            <div className="bis-checklist-text-col">
              <div className="bis-item-title-row">
                <span className="bis-checklist-item-title">{item.title}</span>
                <Badge variant="default" size="sm">
                  {item.category}
                </Badge>
                {item.evidence_ref && (
                  <Badge variant="info" size="sm">
                    {item.evidence_ref}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="bis-checklist-item-desc">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
