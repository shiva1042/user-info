import { useCallback, useRef, useState } from 'react'
import TemplatePreviewCard from './TemplatePreviewCard'

function TemplateSelector({ templates, selectedTemplate, onSelect }) {
  const [hoverTemplate, setHoverTemplate] = useState(null)
  const [hoverPos, setHoverPos] = useState({ top: 0, left: 0 })
  const hideTimeoutRef = useRef(null)

  const handleHover = useCallback((template, element) => {
    clearTimeout(hideTimeoutRef.current)
    const rect = element.getBoundingClientRect()
    setHoverPos({
      top: rect.top,
      left: rect.right + 12,
    })
    setHoverTemplate(template)
  }, [])

  const handleLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => setHoverTemplate(null), 150)
  }, [])

  return (
    <section className="editor-card" aria-label="Template selector">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Templates</p>
          <h2>Switch Visual Direction</h2>
        </div>
        <span className="panel-meta">{templates.length} themes</span>
      </div>
      <div className="template-grid" role="listbox" aria-label="Available templates">
        {templates.map((template) => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplate}
            onSelect={onSelect}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        ))}
      </div>

      {hoverTemplate ? (
        <div
          className="template-hover-preview"
          style={{ top: hoverPos.top, left: hoverPos.left }}
          aria-hidden="true"
        >
          <div
            className="template-hover-mini"
            style={{
              background: hoverTemplate.background,
              color: hoverTemplate.previewTextColor,
            }}
          >
            <span className="hover-badge" style={{ background: hoverTemplate.accent }} />
            <div className="hover-panel" style={{ background: hoverTemplate.cardBackground }} />
            <div className="hover-lines">
              <span style={{ background: hoverTemplate.accent }} />
              <span style={{ background: hoverTemplate.previewLineColor }} />
              <span style={{ background: hoverTemplate.previewLineColor }} />
            </div>
          </div>
          <div className="hover-meta">
            <strong>{hoverTemplate.name}</strong>
            <span>{hoverTemplate.tagline}</span>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TemplateSelector
