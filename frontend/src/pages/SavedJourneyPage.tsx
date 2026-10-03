import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  Compass,
  Trash2,
  ExternalLink,
  Search,
  BookOpen,
} from 'lucide-react';
import { storage } from '../utils/storage';
import { MOCK_STANDARDS } from '../mocks/mockStandardsData';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useCompliance } from '../state/ComplianceContext';

export const SavedJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { checklist } = useCompliance();
  const [savedStandards, setSavedStandards] = useState<string[]>(() => storage.getSavedStandards());
  const [activeTab, setActiveTab] = useState<'all' | 'standards' | 'milestones'>('all');

  const savedDetails = MOCK_STANDARDS.filter((s) => savedStandards.includes(s.standard_number));
  const completedChecklist = checklist.filter((i) => i.completed);

  const handleRemoveBookmark = (stdNum: string) => {
    storage.toggleSavedStandard(stdNum);
    setSavedStandards(storage.getSavedStandards());
  };

  return (
    <div className="bis-page-container">
      {/* Page Header */}
      <div className="bis-page-header">
        <span className="bis-eyebrow">Personal Compliance Workspace</span>
        <h2 className="bis-page-title">Saved Items & Milestones</h2>
        <p className="bis-page-subtitle">
          Manage your bookmarked Indian Standards, review completed audit milestones, and quickly resume active compliance journeys.
        </p>
      </div>

      {/* Summary Stats Row */}
      <div className="bis-saved-stats-row">
        <div className="bis-saved-stat-box">
          <div className="bis-saved-stat-icon-wrap bis-saved-stat-icon-wrap--amber">
            <Bookmark size={20} />
          </div>
          <div className="bis-saved-stat-info">
            <span className="bis-stat-num">{savedStandards.length}</span>
            <span className="bis-stat-label">Bookmarked Standards</span>
          </div>
        </div>

        <div className="bis-saved-stat-box">
          <div className="bis-saved-stat-icon-wrap bis-saved-stat-icon-wrap--emerald">
            <CheckCircle2 size={20} />
          </div>
          <div className="bis-saved-stat-info">
            <span className="bis-stat-num">
              {completedChecklist.length} / {checklist.length}
            </span>
            <span className="bis-stat-label">Milestones Met</span>
          </div>
        </div>

        <div className="bis-saved-stat-box bis-saved-stat-box--action">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/compliance')}
            icon={<Compass size={16} />}
          >
            Open Compliance Roadmap →
          </Button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="bis-saved-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'all'}
          className={`bis-saved-tab-btn ${activeTab === 'all' ? 'bis-saved-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Workspace Items ({savedDetails.length + completedChecklist.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'standards'}
          className={`bis-saved-tab-btn ${activeTab === 'standards' ? 'bis-saved-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('standards')}
        >
          Bookmarked Standards ({savedDetails.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'milestones'}
          className={`bis-saved-tab-btn ${activeTab === 'milestones' ? 'bis-saved-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          Completed Milestones ({completedChecklist.length})
        </button>
      </div>

      {/* Tab Content: Bookmarked Standards */}
      {(activeTab === 'all' || activeTab === 'standards') && (
        <div className="bis-section-container">
          <div className="bis-section-header-flex">
            <div>
              <h3 className="bis-section-heading">Bookmarked Standards</h3>
              <p className="bis-section-subheading">
                Standards you have pinned for fast reference and audit tracking.
              </p>
            </div>
            {savedDetails.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/standards')}
                icon={<Search size={14} />}
              >
                Search More Standards
              </Button>
            )}
          </div>

          {savedDetails.length === 0 ? (
            <div className="bis-empty-results-box">
              <Bookmark size={36} className="bis-empty-icon" />
              <h4 className="bis-empty-title">No standards bookmarked yet</h4>
              <p className="bis-empty-desc">
                When browsing the Indian Standards Directory, click the star icon (☆) on any standard card to pin it here.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/standards')} icon={<Search size={15} />}>
                Explore Standards Directory
              </Button>
            </div>
          ) : (
            <div className="bis-saved-items-grid">
              {savedDetails.map((std) => (
                <div key={std.standard_number} className="bis-saved-item-card">
                  <div className="bis-saved-item-top">
                    <div className="bis-saved-item-badges">
                      <span className="bis-is-badge">{std.standard_number}</span>
                      <Badge variant={std.status === 'Active' ? 'success' : 'warning'} size="sm">
                        {std.status}
                      </Badge>
                      {std.is_mandatory && (
                        <Badge variant="accent" size="sm">
                          Mandatory QCO
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      className="bis-saved-remove-btn"
                      onClick={() => handleRemoveBookmark(std.standard_number)}
                      title="Remove bookmark"
                      aria-label={`Remove ${std.standard_number} from saved`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 className="bis-saved-item-title">{std.title}</h4>
                  <p className="bis-saved-item-desc">{std.overview}</p>

                  <div className="bis-saved-item-meta">
                    <span className="bis-saved-meta-item">
                      <strong>Division:</strong> {std.department}
                    </span>
                    <span className="bis-saved-meta-item">
                      <strong>Year:</strong> {std.publication_year}
                    </span>
                  </div>

                  <div className="bis-saved-item-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/standards/${encodeURIComponent(std.standard_number)}`)}
                      icon={<BookOpen size={14} />}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/compliance')}
                      icon={<ExternalLink size={14} />}
                    >
                      Compliance Journey
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Completed Checklist Milestones */}
      {(activeTab === 'all' || activeTab === 'milestones') && (
        <div className="bis-section-container">
          <div className="bis-section-header-flex">
            <div>
              <h3 className="bis-section-heading">Completed Milestones ({completedChecklist.length})</h3>
              <p className="bis-section-subheading">
                Audit preparation steps and certification requirements marked as done.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/compliance')}>
              View Full Compliance Checklist →
            </Button>
          </div>

          {completedChecklist.length === 0 ? (
            <div className="bis-empty-results-box">
              <CheckCircle2 size={36} className="bis-empty-icon" />
              <h4 className="bis-empty-title">No completed milestones yet</h4>
              <p className="bis-empty-desc">
                Follow your compliance journey steps and mark requirements as done to track audit readiness here.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/compliance')}>
                Go to Compliance Journey
              </Button>
            </div>
          ) : (
            <ul className="bis-completed-milestones-list">
              {completedChecklist.map((item) => (
                <li key={item.id} className="bis-completed-milestone-item">
                  <div className="bis-milestone-check-wrap">
                    <CheckCircle2 size={20} className="bis-milestone-check-icon" />
                  </div>
                  <div className="bis-milestone-text-wrap">
                    <strong className="bis-milestone-item-title">{item.title}</strong>
                    {item.description && (
                      <p className="bis-milestone-item-desc">{item.description}</p>
                    )}
                  </div>
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
