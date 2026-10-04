import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  RotateCcw,
  FlaskConical,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { laboratoryApi } from '../services/laboratoryApi';
import { LaboratoryInfo } from '../types/laboratory';
import { LaboratoryCard } from '../components/laboratories/LaboratoryCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { CardSkeleton } from '../components/common/Skeletons';
import { Button } from '../components/common/Button';
import { useScrollReveal } from '../utils/useScrollReveal';

export const LaboratoriesPage: React.FC = () => {
  const [labs, setLabs] = useState<LaboratoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useScrollReveal([labs, loading]);

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

      {/* 1. Search Bar */}
      <div className="bis-lab-search-container">
        <label htmlFor="lab-search-input" className="sr-only">
          Search Laboratories
        </label>
        <div className="bis-search-input-wrapper">
          <Search size={18} className="bis-search-input-icon" />
          <input
            id="lab-search-input"
            type="search"
            className="bis-input bis-input--with-icon bis-lab-search-input"
            placeholder="Search by laboratory name, city, test capability, or IS standard..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Filter Toolbar: Compact horizontal row with State and Recognition */}
      <div className="bis-lab-filters-toolbar" role="toolbar" aria-label="Laboratory filters">
        <div className="bis-lab-filters-row">
          {/* State Filter */}
          <div
            className={`bis-lab-filter-control ${
              selectedState !== 'All' ? 'bis-lab-filter-control--active' : ''
            }`}
          >
            <label htmlFor="lab-state-select" className="bis-lab-filter-label">
              <MapPin size={14} className="bis-lab-filter-icon" />
              <span>State:</span>
            </label>
            <div className="bis-lab-select-wrapper">
              <select
                id="lab-state-select"
                className="bis-lab-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Filter by state"
              >
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="bis-lab-chevron" aria-hidden="true" />
            </div>
          </div>

          {/* Recognition Filter */}
          <div
            className={`bis-lab-filter-control ${
              selectedStatus !== 'All' ? 'bis-lab-filter-control--active' : ''
            }`}
          >
            <label htmlFor="lab-status-select" className="bis-lab-filter-label">
              <ShieldCheck size={14} className="bis-lab-filter-icon" />
              <span>Recognition:</span>
            </label>
            <div className="bis-lab-select-wrapper">
              <select
                id="lab-status-select"
                className="bis-lab-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by recognition status"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="bis-lab-chevron" aria-hidden="true" />
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              icon={<RotateCcw size={13} />}
              className="bis-lab-reset-btn"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 3. Result Count Row (Dedicated clean row) */}
      <div className="bis-lab-results-count-row">
        <div className="bis-results-count-badge">
          <Filter size={13} />
          <span>
            Found <strong>{labs.length}</strong> recognized test facilities
          </span>
        </div>
      </div>

      {/* 4. Labs Results Section */}
      <div className="bis-labs-results">
        {loading ? (
          <div className="bis-labs-grid" role="status" aria-label="Loading recognized laboratories...">
            <CardSkeleton count={3} />
          </div>
        ) : labs.length === 0 ? (
          <div className="bis-empty-results">
            <FlaskConical size={36} className="bis-text-muted" />
            <h3 className="bis-empty-title">
              {hasActiveFilters
                ? 'No test laboratories match your criteria.'
                : 'No verified laboratories are currently available.'}
            </h3>
            <p className="bis-empty-desc">
              {hasActiveFilters
                ? 'Try adjusting your search terms, changing the state filter, or resetting all filters.'
                : 'Connect to the BIS knowledge service to retrieve verified laboratory information.'}
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
              <div key={lab.id} className="bis-reveal">
                <LaboratoryCard
                  lab={lab}
                  onSelectStandard={(std) => setQuery(std)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
