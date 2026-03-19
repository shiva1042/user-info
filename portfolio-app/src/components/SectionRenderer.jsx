function SectionRenderer({ title, fields, template, isRecommended }) {
  const visibleFields = fields.filter((field) => field.visible)

  if (!visibleFields.length) {
    return null
  }

  return (
    <section
      className="preview-section"
      style={{
        background: template.sectionBackground,
        borderColor: template.dividerColor,
        padding: template.sectionPadding,
      }}
    >
      <div className="preview-section-head">
        <h3>{title}</h3>
        {isRecommended ? <span className="recommendation-badge">Recommended</span> : null}
      </div>
      <div className="preview-field-list">
        {visibleFields.map((field) => (
          <article key={field.id} className="preview-field-item">
            <p className="preview-field-label">{field.label}</p>
            <p className="preview-field-value">{field.value || 'Not added yet'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SectionRenderer
