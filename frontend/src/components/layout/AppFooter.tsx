import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';

export const AppFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bis-footer" role="contentinfo">
      <div className="bis-footer-container">
        <div className="bis-disclaimer-content">
          <div className="bis-disclaimer-badge">
            <Info size={14} className="bis-disclaimer-icon" />
            <span>Official Regulatory Advisory</span>
          </div>
          <p className="bis-disclaimer-text">{t.app.disclaimer}</p>
        </div>

        <div className="bis-footer-links">
          <a
            href="https://www.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bis-footer-link"
          >
            <span>BIS Portal</span>
            <ExternalLink size={12} />
          </a>
          <span className="bis-footer-divider" aria-hidden="true">•</span>
          <a
            href="https://www.manakonline.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bis-footer-link"
          >
            <span>Manakonline (e-BIS)</span>
            <ExternalLink size={12} />
          </a>
          <span className="bis-footer-divider" aria-hidden="true">•</span>
          <a
            href="https://standardsbis.bsbedge.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bis-footer-link"
          >
            <span>Standards Portal (BSB)</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
};
