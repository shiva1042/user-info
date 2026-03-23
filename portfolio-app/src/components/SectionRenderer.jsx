import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'

function SectionRenderer({ title, fields, template, isRecommended, isFullWidth, onToggleWidth }) {
  const visibleFields = fields.filter((field) => field.visible)

  if (!visibleFields.length) {
    return null
  }

  return (
    <section
      className={`preview-section${isFullWidth ? ' full-width' : ''}`}
      style={{
        background: template.sectionBackground,
        borderColor: template.dividerColor,
        padding: template.sectionPadding,
      }}
      aria-label={`${title} section`}
    >
      {onToggleWidth ? (
        <button
          type="button"
          className="section-width-toggle"
          onClick={onToggleWidth}
          title={isFullWidth ? 'Half width' : 'Full width'}
          aria-label={isFullWidth ? 'Set section to half width' : 'Set section to full width'}
          data-no-print
        >
          {isFullWidth ? <FiMinimize2 aria-hidden="true" /> : <FiMaximize2 aria-hidden="true" />}
        </button>
      ) : null}
      <div className="preview-section-head">
        <h3>{title}</h3>
        {isRecommended ? (
          <span className="recommendation-badge" aria-label="Recommended section">Recommended</span>
        ) : null}
      </div>
      <div className="preview-field-list" role="list">
        {visibleFields.map((field) => (
          <article key={field.id} className="preview-field-item" role="listitem">
            <p className="preview-field-label">{field.label}</p>
            <p className="preview-field-value">{field.value || 'Not added yet'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SectionRenderer
