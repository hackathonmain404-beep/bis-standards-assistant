import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  RotateCcw,
  FlaskConical,
  Filter,
} from 'lucide-react';
import { laboratoryApi } from '../services/laboratoryApi';
import { LaboratoryInfo } from '../types/laboratory';
import { LaboratoryCard } from '../components/laboratories/LaboratoryCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';

export const LaboratoriesPage: React.FC = () => {
  const [labs, setLabs] = useState<LaboratoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const states = ['All', 'Uttar Pradesh', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Delhi'];
  const statuses = ['All', 'BIS Central Lab', 'BIS Regional Lab', 'BIS Recognized'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    laboratoryApi
      .getLaboratories({
        query: query.trim() || undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        recognition_status: selectedStatus !== 'All' ? selectedStatus : undefined,
      })
      .then((data) => {
        if (isMounted) {
          setLabs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, selectedState, selectedStatus]);

  const hasActiveFilters = Boolean(query || selectedState !== 'All' || selectedStatus !== 'All');

  const handleResetFilters = () => {
    setQuery('');
    setSelectedState('All');
    setSelectedStatus('All');
  };

  return (
    <div className="bis-page-container">
      {/* Page Header */}
      <div className="bis-page-header">
        <div className="bis-page-eyebrow">
          <FlaskConical size={14} className="bis-eyebrow-icon" />
          <span>Accredited Conformity Assessment Network</span>
        </div>
        <h1 className="bis-page-title">BIS Recognized Testing Laboratories</h1>
        <p className="bis-page-subtitle">
          Discover accredited test laboratories recognized by the Bureau of Indian Standards for sample testing, pre-licensing conformity assessment, and surveillance verification across India.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bis-search-filter-card">
        <div className="bis-search-input-col">
          <label htmlFor="lab-search-input" className="sr-only">
            Search Laboratories
          </label>
          <div className="bis-search-input-wrapper">
            <Search size={18} className="bis-search-input-icon" />
            <input
              id="lab-search-input"
              type="search"
              className="bis-input bis-input--with-icon"
              placeholder="Search by laboratory name, city, test capability, or IS standard..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bis-filters-row">
          <div className="bis-filter-group">
            <label htmlFor="lab-state-select" className="bis-filter-label">
              <MapPin size={13} />
              <span>State:</span>
            </label>
            <select
              id="lab-state-select"
              className="bis-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="bis-filter-group">
            <label htmlFor="lab-status-select" className="bis-filter-label">
              <ShieldCheck size={13} />
              <span>Recognition:</span>
            </label>
            <select
              id="lab-status-select"
              className="bis-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              icon={<RotateCcw size={13} />}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Labs Results Section */}
      <div className="bis-labs-results">
        <div className="bis-results-header">
          <div className="bis-results-count-badge">
            <Filter size={13} />
            <span>
              Found <strong>{labs.length}</strong> recognized test facilities
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton lines={4} message="Fetching recognized laboratory directory..." />
        ) : labs.length === 0 ? (
          <div className="bis-empty-results">
            <FlaskConical size={36} className="bis-text-muted" />
            <h3 className="bis-empty-title">No test laboratories match your criteria</h3>
            <p className="bis-empty-desc">
              Try adjusting your search terms, changing the state filter, or resetting all filters.
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleResetFilters} icon={<RotateCcw size={14} />}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="bis-labs-grid">
            {labs.map((lab) => (
              <LaboratoryCard
                key={lab.id}
                lab={lab}
                onSelectStandard={(std) => setQuery(std)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
