import React, { useState } from 'react';
import { MissingInformationField } from '../../types/assistant';
import { Button } from '../common/Button';

export interface ClarificationFormProps {
  fields: MissingInformationField[];
  onSubmit: (values: Record<string, string>) => void;
  isLoading?: boolean;
}

export const ClarificationForm: React.FC<ClarificationFormProps> = ({
  fields,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.field] = f.options && f.options.length > 0 ? f.options[0] : '';
    });
    return initial;
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bis-clarification-card">
      <div className="bis-clarification-header">
        <span className="bis-clarification-icon" aria-hidden="true">
          📋
        </span>
        <div>
          <h4 className="bis-clarification-title">More Information is Required</h4>
          <p className="bis-clarification-subtitle">
            To identify the exact applicable Indian Standards, please specify these missing parameters:
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bis-clarification-form">
        <div className="bis-clarification-fields">
          {fields.map((field) => (
            <div key={field.field} className="bis-form-group">
              <label htmlFor={`field-${field.field}`} className="bis-form-label">
                {field.label}
                {field.required && <span className="bis-required-star"> *</span>}
              </label>

              {field.input_type === 'select' && field.options ? (
                <select
                  id={`field-${field.field}`}
                  className="bis-select"
                  value={formData[field.field] || ''}
                  onChange={(e) => handleChange(field.field, e.target.value)}
                  required={field.required}
                >
                  {field.options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.input_type === 'number' ? (
                <input
                  id={`field-${field.field}`}
                  type="number"
                  step="any"
                  className="bis-input"
                  placeholder={field.placeholder || ''}
                  value={formData[field.field] || ''}
                  onChange={(e) => handleChange(field.field, e.target.value)}
                  required={field.required}
                />
              ) : (
                <input
                  id={`field-${field.field}`}
                  type="text"
                  className="bis-input"
                  placeholder={field.placeholder || ''}
                  value={formData[field.field] || ''}
                  onChange={(e) => handleChange(field.field, e.target.value)}
                  required={field.required}
                />
              )}

              {field.help_text && (
                <span className="bis-form-help">{field.help_text}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bis-clarification-footer">
          <Button
            type="submit"
            variant="accent"
            size="md"
            isLoading={isLoading}
          >
            Continue with Selected Details →
          </Button>
        </div>
      </form>
    </div>
  );
};
