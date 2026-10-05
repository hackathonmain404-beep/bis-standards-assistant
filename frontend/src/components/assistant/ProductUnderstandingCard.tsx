import React from 'react';
import { PackageCheck, CheckCircle2 } from 'lucide-react';
import { ProductUnderstanding } from '../../types/assistant';

export interface ProductUnderstandingCardProps {
  product: ProductUnderstanding;
}

export const ProductUnderstandingCard: React.FC<ProductUnderstandingCardProps> = ({ product }) => {
  // Extract key attributes
  const materialAttr = product.attributes?.find(
    (a) => (a.key || '').toLowerCase().includes('material') || (a.key || '').toLowerCase().includes('steel')
  );
  const capacityAttr = product.attributes?.find(
    (a) => (a.key || '').toLowerCase().includes('capacity') || (a.key || '').toLowerCase().includes('volume') || (a.key || '').toLowerCase().includes('size')
  );
  const typeAttr = product.attributes?.find(
    (a) => (a.key || '').toLowerCase().includes('type') || (a.key || '').toLowerCase().includes('application')
  );

  // Other remaining attributes
  const otherAttributes = product.attributes?.filter(
    (a) => a !== materialAttr && a !== capacityAttr && a !== typeAttr
  ) || [];

  return (
    <div className="bis-product-understanding-card" role="region" aria-label="Product Understanding">
      <div className="bis-product-understanding-header">
        <div className="bis-product-understanding-badge">
          <PackageCheck size={16} className="bis-product-badge-icon" aria-hidden="true" />
          <span className="bis-product-badge-text">PRODUCT UNDERSTANDING</span>
        </div>
        <div className="bis-product-confirmed-tag">
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>Extracted from your query</span>
        </div>
      </div>

      <div className="bis-product-name-row">
        <h4 className="bis-product-title">{product.name}</h4>
        {product.category && (
          <span className="bis-product-category-chip">{product.category}</span>
        )}
      </div>

      <div className="bis-product-specs-grid">
        <div className="bis-product-spec-item">
          <span className="bis-spec-label">Domain Category</span>
          <span className="bis-spec-value">{product.category || 'Domestic / Industrial Standard'}</span>
        </div>

        <div className="bis-product-spec-item">
          <span className="bis-spec-label">Intended Use</span>
          <span className="bis-spec-value">{product.intended_use || 'Not provided'}</span>
        </div>

        {materialAttr && (
          <div className="bis-product-spec-item">
            <span className="bis-spec-label">{materialAttr.key}</span>
            <span className="bis-spec-value">{materialAttr.value}</span>
          </div>
        )}

        {capacityAttr && (
          <div className="bis-product-spec-item">
            <span className="bis-spec-label">{capacityAttr.key}</span>
            <span className="bis-spec-value">{capacityAttr.value}</span>
          </div>
        )}

        {typeAttr && (
          <div className="bis-product-spec-item">
            <span className="bis-spec-label">{typeAttr.key}</span>
            <span className="bis-spec-value">{typeAttr.value}</span>
          </div>
        )}
      </div>

      {otherAttributes.length > 0 && (
        <div className="bis-product-attributes-row">
          {otherAttributes.map((attr, idx) => (
            <div key={idx} className="bis-attr-pill">
              <span className="bis-attr-key">{attr.key}:</span>
              <span className="bis-attr-val">{attr.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
