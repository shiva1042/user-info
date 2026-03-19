function TemplatePreviewCard({ template, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`template-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(template.id)}
      aria-pressed={isSelected}
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
        />
        <div
          className="template-mini-panel"
          style={{ background: template.cardBackground }}
        />
        <div className="template-mini-lines">
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
