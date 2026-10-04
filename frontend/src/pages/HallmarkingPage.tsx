import React, { useRef } from 'react';
import {
  ShieldCheck,
  Award,
  QrCode,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Scale,
  Sparkles,
  Info,
  ArrowDown,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useScrollReveal } from '../utils/useScrollReveal';

export const HallmarkingPage: React.FC = () => {
  const marksRef = useRef<HTMLDivElement>(null);
  const gradesRef = useRef<HTMLDivElement>(null);
  const huidRef = useRef<HTMLDivElement>(null);

  useScrollReveal();

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bis-page-container">
      {/* Page Header */}
      <div className="bis-page-header">
        <div className="bis-page-eyebrow">
          <Sparkles size={14} className="bis-eyebrow-icon" />
          <span>Statutory Purity & Consumer Protection</span>
        </div>
        <h1 className="bis-page-title">BIS Hallmarking System for Precious Metals</h1>
        <p className="bis-page-subtitle">
          Statutory purity certification and Hallmark Unique Identification (HUID) regulatory framework governing gold and silver jewelry in India under Indian Standard IS 1417.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="bis-hallmark-quick-nav-grid">
        <button
          type="button"
          className="bis-hallmark-nav-tile"
          onClick={() => scrollToSection(marksRef)}
        >
          <div className="bis-nav-tile-icon-wrap">
            <ShieldCheck size={20} className="bis-text-accent" />
          </div>
          <div className="bis-nav-tile-text">
            <span className="bis-nav-tile-title">1. The 3 Mandatory Marks</span>
            <span className="bis-nav-tile-desc">Triangular BIS emblem, purity, & HUID</span>
          </div>
          <ArrowDown size={15} className="bis-nav-tile-arrow" />
        </button>

        <button
          type="button"
          className="bis-hallmark-nav-tile"
          onClick={() => scrollToSection(gradesRef)}
        >
          <div className="bis-nav-tile-icon-wrap">
            <Award size={20} className="bis-text-accent" />
          </div>
          <div className="bis-nav-tile-text">
            <span className="bis-nav-tile-title">2. Gold Purity & Grades</span>
            <span className="bis-nav-tile-desc">IS 1417 caratage & fineness reference</span>
          </div>
          <ArrowDown size={15} className="bis-nav-tile-arrow" />
        </button>

        <button
          type="button"
          className="bis-hallmark-nav-tile"
          onClick={() => scrollToSection(huidRef)}
        >
          <div className="bis-nav-tile-icon-wrap">
            <QrCode size={20} className="bis-text-accent" />
          </div>
          <div className="bis-nav-tile-text">
            <span className="bis-nav-tile-title">3. HUID Verification App</span>
            <span className="bis-nav-tile-desc">Verify authenticity via BIS CARE app</span>
          </div>
          <ArrowDown size={15} className="bis-nav-tile-arrow" />
        </button>
      </div>

      {/* The 3 Mandatory Marks Section (3-Card Layout) */}
      <section ref={marksRef} className="bis-section-container">
        <div className="bis-section-header-row">
          <div>
            <span className="bis-step-meta-badge">Statutory Requirement</span>
            <h2 className="bis-section-heading">The 3 Mandatory Marks on Gold Jewelry</h2>
          </div>
          <Badge variant="accent" size="sm">
            Mandatory Since 2021
          </Badge>
        </div>
        <p className="bis-section-intro">
          Under the Hallmarking of Gold Jewellery and Artefacts Order issued by the Ministry of Consumer Affairs, every piece of gold jewelry sold by registered jewelers must bear these three distinct marks:
        </p>

        <div className="bis-three-marks-grid">
          {/* Mark 1: BIS Standard Mark */}
          <div className="bis-mark-box bis-reveal">
            <div className="bis-mark-box-top">
              <div className="bis-mark-icon-wrap">
                <ShieldCheck size={28} className="bis-mark-icon" />
              </div>
              <span className="bis-mark-number-pill">Mark 1</span>
            </div>
            <h3 className="bis-mark-num">BIS Standard Mark</h3>
            <p className="bis-mark-desc">
              The official triangular hallmark logo certifying that the gold article has been tested and certified by a BIS-recognized Assaying & Hallmarking Centre (AHC) in accordance with Indian Standard IS 1417.
            </p>
            <div className="bis-mark-spec-box">
              <span className="bis-spec-label">Regulatory Clause:</span>
              <span className="bis-spec-value">IS 1417:2018 Clause 5.1</span>
            </div>
          </div>

          {/* Mark 2: Purity / Fineness Grade */}
          <div className="bis-mark-box bis-reveal">
            <div className="bis-mark-box-top">
              <div className="bis-mark-icon-wrap">
                <Award size={28} className="bis-mark-icon" />
              </div>
              <span className="bis-mark-number-pill">Mark 2</span>
            </div>
            <h3 className="bis-mark-num">Purity / Fineness Grade</h3>
            <p className="bis-mark-desc">
              Clear designation of pure gold content in parts per thousand alongside caratage. Common permissible grades include <strong>22K916</strong> (91.6% pure), <strong>18K750</strong> (75.0% pure), and <strong>14K585</strong> (58.5% pure).
            </p>
            <div className="bis-mark-spec-box">
              <span className="bis-spec-label">Standard Permissible Grades:</span>
              <span className="bis-spec-value">24K, 23K, 22K, 20K, 18K, 14K</span>
            </div>
          </div>

          {/* Mark 3: 6-Digit HUID Code */}
          <div className="bis-mark-box bis-reveal">
            <div className="bis-mark-box-top">
              <div className="bis-mark-icon-wrap">
                <QrCode size={28} className="bis-mark-icon" />
              </div>
              <span className="bis-mark-number-pill">Mark 3</span>
            </div>
            <h3 className="bis-mark-num">6-Digit HUID Code</h3>
            <p className="bis-mark-desc">
              <strong>Hallmark Unique Identification:</strong> A unique 6-character alphanumeric code laser-engraved on each individual piece of jewelry at the recognized AHC. Ensures complete traceability and authenticity.
            </p>
            <div className="bis-mark-spec-box">
              <span className="bis-spec-label">Consumer Security:</span>
              <span className="bis-spec-value">Tamper-proof traceability in e-BIS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference Summary Bar */}
      <div className="bis-hallmark-summary-bar">
        <div className="bis-summary-stat">
          <span className="bis-summary-stat-label">Governing Standard</span>
          <span className="bis-summary-stat-value">IS 1417:2018</span>
        </div>
        <div className="bis-summary-divider" />
        <div className="bis-summary-stat">
          <span className="bis-summary-stat-label">Certification Marks</span>
          <span className="bis-summary-stat-value">3 Mandatory Marks</span>
        </div>
        <div className="bis-summary-divider" />
        <div className="bis-summary-stat">
          <span className="bis-summary-stat-label">Verification App</span>
          <span className="bis-summary-stat-value">BIS CARE Mobile App</span>
        </div>
        <div className="bis-summary-divider" />
        <div className="bis-summary-stat">
          <span className="bis-summary-stat-label">Consumer Rights</span>
          <span className="bis-summary-stat-value">AHC Testing at ₹45</span>
        </div>
      </div>

      {/* Gold Grades Table */}
      <section ref={gradesRef} className="bis-section-container">
        <div className="bis-section-header-row">
          <div>
            <span className="bis-step-meta-badge">Conformity Table</span>
            <h2 className="bis-section-heading">Standard Gold Purity Grades (IS 1417)</h2>
          </div>
          <span className="bis-table-caption-badge">Purity in Parts per Thousand (PPT)</span>
        </div>
        <p className="bis-section-intro">
          BIS recognizes six standard caratage and fineness grades for hallmarking in India. Only jewelry complying with these exact purity standards may be certified:
        </p>

        <div className="bis-table-responsive bis-reveal">
          <table className="bis-table" aria-label="Standard Gold Purity Grades">
            <thead>
              <tr>
                <th scope="col">Caratage</th>
                <th scope="col">Fineness (Parts per 1000)</th>
                <th scope="col">Hallmark Inscription</th>
                <th scope="col">Gold Content (%)</th>
                <th scope="col">Primary Jewelry Usage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Badge variant="accent">24K</Badge></td>
                <td><strong>999</strong></td>
                <td><code>24K999</code></td>
                <td>99.9% Pure Gold</td>
                <td>Bullion, gold coins, commemorative bars (investment)</td>
              </tr>
              <tr>
                <td><Badge variant="success">22K</Badge></td>
                <td><strong>916</strong></td>
                <td><code>22K916</code></td>
                <td>91.6% Pure Gold</td>
                <td>Traditional Indian handcrafted wedding jewelry (highest demand)</td>
              </tr>
              <tr>
                <td><Badge variant="default">20K</Badge></td>
                <td><strong>833</strong></td>
                <td><code>20K833</code></td>
                <td>83.3% Pure Gold</td>
                <td>Specialized high-durability handcrafted ornaments</td>
              </tr>
              <tr>
                <td><Badge variant="info">18K</Badge></td>
                <td><strong>750</strong></td>
                <td><code>18K750</code></td>
                <td>75.0% Pure Gold</td>
                <td>Diamond-studded, gemstone-mounted, and modern designer jewelry</td>
              </tr>
              <tr>
                <td><Badge variant="default">14K</Badge></td>
                <td><strong>585</strong></td>
                <td><code>14K585</code></td>
                <td>58.5% Pure Gold</td>
                <td>Contemporary daily-wear and lightweight fashion jewelry</td>
              </tr>
              <tr>
                <td><Badge variant="default">9K</Badge></td>
                <td><strong>375</strong></td>
                <td><code>9K375</code></td>
                <td>37.5% Pure Gold</td>
                <td>Ultra-lightweight fashion accessories and exports</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Consumer Protection Guide via BIS CARE App */}
      <section ref={huidRef} className="bis-section-container bis-consumer-guide-box">
        <div className="bis-section-header-row">
          <div>
            <span className="bis-step-meta-badge">Step-by-Step Verification</span>
            <h2 className="bis-section-heading">How Consumers Verify HUID via BIS CARE App</h2>
          </div>
          <div className="bis-consumer-app-badge">
            <Smartphone size={15} />
            <span>Official Government App</span>
          </div>
        </div>
        <p className="bis-section-intro">
          Consumers can verify the authenticity of any hallmarked jewelry in seconds before completing their purchase using the official mobile application:
        </p>

        <div className="bis-steps-mini-guide">
          <div className="bis-mini-step">
            <div className="bis-mini-step-num">1</div>
            <div className="bis-mini-step-content">
              <h4 className="bis-mini-step-title">Download BIS CARE</h4>
              <p>Install the official <strong>BIS CARE</strong> application from Google Play Store or Apple App Store.</p>
            </div>
          </div>
          <div className="bis-mini-step">
            <div className="bis-mini-step-num">2</div>
            <div className="bis-mini-step-content">
              <h4 className="bis-mini-step-title">Select "Verify HUID"</h4>
              <p>Tap the <strong>Verify HUID</strong> service icon on the home screen of the application.</p>
            </div>
          </div>
          <div className="bis-mini-step">
            <div className="bis-mini-step-num">3</div>
            <div className="bis-mini-step-content">
              <h4 className="bis-mini-step-title">Enter 6-Digit Code</h4>
              <p>Type the 6-character laser-engraved alphanumeric HUID from your jewelry article.</p>
            </div>
          </div>
          <div className="bis-mini-step">
            <div className="bis-mini-step-num">4</div>
            <div className="bis-mini-step-content">
              <h4 className="bis-mini-step-title">Verify Official Record</h4>
              <p>Instantly inspect the Jeweler Name, AHC Lab Name, Hallmarking Date, and Certified Caratage.</p>
            </div>
          </div>
        </div>

        {/* Consumer Rights Banner */}
        <div className="bis-consumer-rights-card">
          <div className="bis-rights-icon-wrap">
            <Scale size={24} className="bis-text-accent" />
          </div>
          <div className="bis-rights-content">
            <h4 className="bis-rights-title">Statutory Consumer Rights & Testing Guarantee</h4>
            <p className="bis-rights-desc">
              Any consumer can get their hallmarked jewelry tested for purity at any BIS-recognized Assaying and Hallmarking Centre (AHC) for a nominal fee (approx. ₹45). In case of any purity dispute, the registered jeweler is legally liable under Section 15 of the BIS Act 2016 to compensate the consumer for the purity difference.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
