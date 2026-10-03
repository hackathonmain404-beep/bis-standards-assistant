import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { standardsApi } from '../services/standardsApi';
import { StandardDetail } from '../types/standards';
import { StandardCard } from '../components/standards/StandardCard';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Modal } from '../components/common/Modal';

export const StandardsSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [qcoFilter, setQcoFilter] = useState<'all' | 'mandatory' | 'voluntary'>('all');
  const [selectedScheme, setSelectedScheme] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'number-asc' | 'number-desc' | 'year-desc' | 'title-asc'>('relevance');
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [standards, setStandards] = useState<StandardDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Food & Beverages',
    'Electrical & Electronics',
    'Consumer Goods & Hardware',
    'Civil & Structural Engineering',
    'Textiles & Apparel',
  ];

  const divisions = [
    'All',
    'Food and Agriculture Division (FAD)',
    'Mechanical Engineering Division (MED)',
    'Electrotechnical Division (ETD)',
  ];

  const statuses = ['All', 'Active', 'Under Revision', 'Withdrawn'];

  const schemes = [
    'All',
    'Scheme-I (ISI Mark Certification)',
  ];

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedDivision !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (qcoFilter !== 'all') count++;
    if (selectedScheme !== 'All') count++;
    return count;
  }, [selectedCategory, selectedDivision, selectedStatus, qcoFilter, selectedScheme]);

  const hasAnyFilterOrSearch = query.trim() !== '' || activeFilterCount > 0;

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedDivision('All');
    setSelectedStatus('All');
    setQcoFilter('all');
    setSelectedScheme('All');
    setSortBy('relevance');
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    let mandatoryParam: boolean | undefined = undefined;
    if (qcoFilter === 'mandatory') mandatoryParam = true;
    else if (qcoFilter === 'voluntary') mandatoryParam = false;

    standardsApi
      .getStandards({
        query: query.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        department: selectedDivision !== 'All' ? selectedDivision : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        mandatoryOnly: mandatoryParam,
        scheme: selectedScheme !== 'All' ? selectedScheme : undefined,
        sort: sortBy,
      })
      .then((data) => {
        if (isMounted) {
          // If voluntary only was requested, filter for is_mandatory === false
          let finalData = data;
          if (qcoFilter === 'voluntary') {
            finalData = finalData.filter((s) => !s.is_mandatory);
          }
          setStandards(finalData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, selectedCategory, selectedDivision, selectedStatus, qcoFilter, selectedScheme, sortBy]);

  return (
    <div className="bis-page-container">
      {/* Page Header */}
      <div className="bis-page-header">
        <span className="bis-eyebrow">National Standards Directory</span>
        <h2 className="bis-page-title">Search & Verify Indian Standards</h2>
        <p className="bis-page-subtitle">
          Discover mandatory Quality Control Orders (QCOs), inspect testing specifications, and locate official BIS certification schemes.
        </p>
      </div>

      {/* Search & Filter Workspace */}
      <div className="bis-search-workspace-card">
        {/* Primary Search Input Row */}
        <div className="bis-search-primary-row">
          <div className="bis-search-input-wrapper">
            <Search size={18} className="bis-search-icon" />
            <input
              id="std-search-input"
              type="search"
              className="bis-search-main-input"
              placeholder="Search by IS number (e.g. IS 14543), product, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Indian Standards"
            />
            {query && (
              <button
                type="button"
                className="bis-search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            className="bis-mobile-filter-trigger"
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Open filter options"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bis-filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Desktop Filter Toolbar */}
        <div className="bis-desktop-filter-toolbar">
          <div className="bis-filter-group-container">
            {/* Classification Group */}
            <div className="bis-filter-group-card">
              <span className="bis-filter-group-header">Classification</span>
              <div className="bis-filter-group-fields">
                <div className="bis-toolbar-filter-item">
                  <label htmlFor="std-cat-select" className="bis-toolbar-label">
                    Category
                  </label>
                  <select
                    id="std-cat-select"
                    className="bis-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bis-toolbar-filter-item">
                  <label htmlFor="std-div-select" className="bis-toolbar-label">
                    Technical Division
                  </label>
                  <select
                    id="std-div-select"
                    className="bis-select"
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                  >
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Regulatory Group */}
            <div className="bis-filter-group-card">
              <span className="bis-filter-group-header">Regulatory & Compliance</span>
              <div className="bis-filter-group-fields">
                <div className="bis-toolbar-filter-item">
                  <label htmlFor="std-status-select" className="bis-toolbar-label">
                    Status
                  </label>
                  <select
                    id="std-status-select"
                    className="bis-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bis-toolbar-filter-item">
                  <label htmlFor="std-qco-select" className="bis-toolbar-label">
                    Regulatory QCO
                  </label>
                  <select
                    id="std-qco-select"
                    className="bis-select"
                    value={qcoFilter}
                    onChange={(e) => setQcoFilter(e.target.value as 'all' | 'mandatory' | 'voluntary')}
                  >
                    <option value="all">All Standards</option>
                    <option value="mandatory">Mandatory QCO Only</option>
                    <option value="voluntary">Voluntary Standards</option>
                  </select>
                </div>

                <div className="bis-toolbar-filter-item">
                  <label htmlFor="std-scheme-select" className="bis-toolbar-label">
                    Certification Scheme
                  </label>
                  <select
                    id="std-scheme-select"
                    className="bis-select"
                    value={selectedScheme}
                    onChange={(e) => setSelectedScheme(e.target.value)}
                  >
                    {schemes.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* More Filters Trigger */}
            <div className="bis-filter-more-card">
              <button
                type="button"
                className="bis-more-filters-btn"
                onClick={() => setIsFilterModalOpen(true)}
                aria-label="Open advanced filter drawer"
              >
                <SlidersHorizontal size={15} />
                <span>+ More Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bis-filter-count-badge">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasAnyFilterOrSearch && (
          <div className="bis-active-chips-bar">
            <span className="bis-chips-label">Active filters:</span>
            <div className="bis-chips-flow">
              {query.trim() && (
                <span className="bis-filter-chip">
                  <span>Search: &ldquo;{query}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Remove search filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="bis-filter-chip">
                  <span>Category: {selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    aria-label="Remove category filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedDivision !== 'All' && (
                <span className="bis-filter-chip">
                  <span>Division: {selectedDivision.split('(')[1]?.replace(')', '') || selectedDivision}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDivision('All')}
                    aria-label="Remove division filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedStatus !== 'All' && (
                <span className="bis-filter-chip">
                  <span>Status: {selectedStatus}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('All')}
                    aria-label="Remove status filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {qcoFilter !== 'all' && (
                <span className="bis-filter-chip">
                  <span>{qcoFilter === 'mandatory' ? 'Mandatory QCO' : 'Voluntary'}</span>
                  <button
                    type="button"
                    onClick={() => setQcoFilter('all')}
                    aria-label="Remove QCO filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {selectedScheme !== 'All' && (
                <span className="bis-filter-chip">
                  <span>Scheme: ISI Mark</span>
                  <button
                    type="button"
                    onClick={() => setSelectedScheme('All')}
                    aria-label="Remove scheme filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              <button
                type="button"
                className="bis-clear-all-chips-btn"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header: Count & Sort */}
      <div className="bis-results-header-row">
        <div className="bis-results-count-wrap">
          <span className="bis-results-count-text">
            <strong>{standards.length}</strong> {standards.length === 1 ? 'standard' : 'standards'} found
          </span>
          {standards.length > 0 && (
            <span className="bis-results-range-pill">Showing 1–{standards.length} of {standards.length}</span>
          )}
        </div>

        <div className="bis-results-sort-wrap">
          <ArrowUpDown size={15} className="bis-sort-icon" />
          <label htmlFor="std-sort-select" className="bis-sort-label">
            Sort by:
          </label>
          <select
            id="std-sort-select"
            className="bis-select bis-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort standards results"
          >
            <option value="relevance">Relevance</option>
            <option value="number-asc">IS Number (Ascending)</option>
            <option value="number-desc">IS Number (Descending)</option>
            <option value="year-desc">Publication Year (Newest)</option>
            <option value="title-asc">Standard Title (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="bis-standards-results-container">
        {loading ? (
          <div className="bis-loading-card-wrap">
            <LoadingSkeleton lines={4} message="Querying authoritative BIS database..." />
          </div>
        ) : standards.length === 0 ? (
          <div className="bis-empty-results-box">
            <BookOpen size={42} className="bis-empty-icon" />
            <h3 className="bis-empty-title">No matching standards found</h3>
            <p className="bis-empty-desc">
              We couldn&apos;t find any standards matching your active search or filters. Try removing a filter or searching for a product name like &ldquo;water bottle&rdquo; or &ldquo;electric iron&rdquo;.
            </p>
            {hasAnyFilterOrSearch && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} icon={<RotateCcw size={14} />}>
                Reset all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="bis-standards-grid">
            {standards.map((std) => (
              <StandardCard
                key={std.standard_number}
                standard={{
                  standard_number: std.standard_number,
                  title: std.title,
                  status: std.status,
                  short_description: std.overview,
                  is_mandatory: std.is_mandatory,
                  qco_order: std.qco_reference,
                  match_reasons: [
                    { category: 'Technical Division', label: std.department, status: 'matched' },
                    { category: 'Category', label: std.category, status: 'matched' },
                    {
                      category: 'Mandatory Status',
                      label: std.is_mandatory ? 'Enforced under QCO' : 'Voluntary Standard',
                      status: 'matched',
                    },
                  ],
                }}
                onViewStandard={(num) => navigate(`/standards/${encodeURIComponent(num)}`)}
                onStartCompliance={(_num) => navigate('/compliance')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer / Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Standards"
        maxWidth="md"
        footer={
          <div className="bis-modal-actions-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleResetFilters();
                setIsFilterModalOpen(false);
              }}
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply Filters ({activeFilterCount})
            </Button>
          </div>
        }
      >
        <div className="bis-mobile-modal-filters-list">
          <div className="bis-form-group">
            <label className="bis-form-label" htmlFor="mob-cat-select">
              Category
            </label>
            <select
              id="mob-cat-select"
              className="bis-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="bis-form-group">
            <label className="bis-form-label" htmlFor="mob-div-select">
              Technical Division
            </label>
            <select
              id="mob-div-select"
              className="bis-select"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="bis-form-group">
            <label className="bis-form-label" htmlFor="mob-status-select">
              Standard Status
            </label>
            <select
              id="mob-status-select"
              className="bis-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="bis-form-group">
            <label className="bis-form-label" htmlFor="mob-qco-select">
              Regulatory QCO Filter
            </label>
            <select
              id="mob-qco-select"
              className="bis-select"
              value={qcoFilter}
              onChange={(e) => setQcoFilter(e.target.value as 'all' | 'mandatory' | 'voluntary')}
            >
              <option value="all">All Standards</option>
              <option value="mandatory">Mandatory QCO Only</option>
              <option value="voluntary">Voluntary Standards</option>
            </select>
          </div>

          <div className="bis-form-group">
            <label className="bis-styled-checkbox-label">
              <input
                type="checkbox"
                id="modal-qco-checkbox"
                className="bis-styled-checkbox-input"
                checked={qcoFilter === 'mandatory'}
                onChange={(e) => setQcoFilter(e.target.checked ? 'mandatory' : 'all')}
              />
              <span>Enforce Mandatory QCO Orders Only</span>
            </label>
            <span className="bis-form-help">
              Show only standards enforced under statutory Quality Control Orders by Central Ministries.
            </span>
          </div>

          <div className="bis-form-group">
            <label className="bis-form-label" htmlFor="mob-scheme-select">
              Certification Scheme
            </label>
            <select
              id="mob-scheme-select"
              className="bis-select"
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
            >
              {schemes.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
