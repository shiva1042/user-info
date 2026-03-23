function TemplatePreviewCard({ template, isSelected, onSelect, onHover, onLeave }) {
  return (
    <button
      type="button"
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(template.id)}
      onMouseEnter={(e) => onHover?.(template, e.currentTarget)}
      onMouseLeave={() => onLeave?.()}
      aria-pressed={isSelected}
      aria-label={`${template.name} template: ${template.tagline}${isSelected ? ' (selected)' : ''}`}
    >
      <div
        className="template-mini"
        style={{
          background: template.background,
          color: template.previewTextColor,
        }}
      >
        <span
          className="template-mini-badge"
          style={{ background: template.accent }}
          aria-hidden="true"
        />
        <div
          className="template-mini-panel"
          style={{ background: template.cardBackground }}
          aria-hidden="true"
        />
        <div className="template-mini-lines" aria-hidden="true">
          <span style={{ background: template.accent }} />
          <span style={{ background: template.previewLineColor }} />
          <span style={{ background: template.previewLineColor }} />
        </div>
      </div>
      <div className="template-card-copy">
        <strong>{template.name}</strong>
        <span>{template.tagline}</span>
      </div>
    </button>
  )
}

export default TemplatePreviewCard
