import TemplatePreviewCard from './TemplatePreviewCard'

function TemplateSelector({ templates, selectedTemplate, onSelect }) {
  return (
    <section className="editor-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Templates</p>
          <h2>Switch Visual Direction</h2>
        </div>
        <span className="panel-meta">{templates.length} themes</span>
      </div>
      <div className="template-grid">
        {templates.map((template) => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplate}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}

export default TemplateSelector
