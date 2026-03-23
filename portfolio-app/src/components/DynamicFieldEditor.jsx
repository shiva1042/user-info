import { useRef, useState } from 'react'
import { FiChevronDown, FiEye, FiEyeOff, FiPlus, FiTrash2, FiMenu } from 'react-icons/fi'

const MAX_CHARS = 500

function DynamicFieldEditor({
  title,
  fields = [],
  onUpdateField,
  onDeleteField,
  onAddField,
  onReorderFields,
  onRequestDelete,
  isRecommended,
  searchQuery = '',
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const dragItemRef = useRef(null)
  const dragOverRef = useRef(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  const filledCount = fields.filter((f) => f.value.trim()).length

  // Filter by search
  const query = searchQuery.toLowerCase().trim()
  const filteredFields = query
    ? fields.filter(
        (f) =>
          f.label.toLowerCase().includes(query) ||
          f.value.toLowerCase().includes(query),
      )
    : fields

  if (query && filteredFields.length === 0) {
    return null
  }

  function handleDragStart(e, index) {
    dragItemRef.current = index
    setDraggingId(fields[index]?.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    dragOverRef.current = index
    setDragOverId(fields[index]?.id)
  }

  function handleDragEnd() {
    if (
      dragItemRef.current !== null &&
      dragOverRef.current !== null &&
      dragItemRef.current !== dragOverRef.current &&
      onReorderFields
    ) {
      onReorderFields(dragItemRef.current, dragOverRef.current)
    }
    dragItemRef.current = null
    dragOverRef.current = null
    setDragOverId(null)
    setDraggingId(null)
  }

  return (
    <section className="editor-card" aria-label={`${title} section editor`}>
      <button
        type="button"
        className="section-collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title}`}
      >
        <div className="panel-heading" style={{ marginBottom: 0, flex: 1 }}>
          <div>
            <p className="eyebrow">Section</p>
            <h2>{title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isRecommended ? (
              <span className="panel-meta highlighted">Recommended</span>
            ) : null}
            <span className="field-count" aria-label={`${filledCount} of ${fields.length} fields filled`}>
              {filledCount}/{fields.length}
            </span>
            <FiChevronDown
              className={`collapse-chevron ${isCollapsed ? 'collapsed' : ''}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      <div
        className={`section-body ${isCollapsed ? 'collapsed' : 'expanded'}`}
        aria-hidden={isCollapsed}
      >
        <div style={{ paddingTop: '1rem' }}>
          <div className="field-stack">
            {filteredFields.map((field) => {
              const fieldIndex = fields.findIndex((f) => f.id === field.id)
              return (
                <article
                  key={field.id}
                  className={`field-card${draggingId === field.id ? ' dragging' : ''}${dragOverId === field.id ? ' drag-over' : ''}`}
                  draggable={!!onReorderFields}
                  onDragStart={(e) => handleDragStart(e, fieldIndex)}
                  onDragOver={(e) => handleDragOver(e, fieldIndex)}
                  onDragEnd={handleDragEnd}
                  aria-label={`Field: ${field.label || 'Untitled'}`}
                >
                  <div className="field-card-top">
                    {onReorderFields ? (
                      <div className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
                        <FiMenu aria-hidden="true" />
                      </div>
                    ) : null}
                    <label>
                      <span>Label</span>
                      <input
                        type="text"
                        value={field.label}
                        placeholder="Field name"
                        aria-label={`Label for field ${field.label || 'untitled'}`}
                        onChange={(event) =>
                          onUpdateField(field.id, { label: event.target.value })
                        }
                      />
                    </label>
                    <div className="field-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onUpdateField(field.id, { visible: !field.visible })}
                        title={field.visible ? 'Hide from preview' : 'Show in preview'}
                        aria-label={field.visible ? 'Hide field from preview' : 'Show field in preview'}
                      >
                        {field.visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => {
                          if (onRequestDelete) {
                            onRequestDelete(field.id, field.label)
                          } else {
                            onDeleteField(field.id)
                          }
                        }}
                        title="Delete field"
                        aria-label={`Delete field ${field.label || 'untitled'}`}
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label>
                    <span>Value</span>
                    <textarea
                      rows="3"
                      value={field.value}
                      placeholder={field.placeholder || 'Enter details'}
                      aria-label={`Value for field ${field.label || 'untitled'}`}
                      onChange={(event) =>
                        onUpdateField(field.id, { value: event.target.value, type: 'textarea' })
                      }
                    />
                  </label>
                  <div className={`char-count${field.value.length > MAX_CHARS ? ' over-limit' : ''}`}>
                    {field.value.length}/{MAX_CHARS}
                  </div>
                  <div className="field-card-footer">
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={field.visible}
                        onChange={(event) =>
                          onUpdateField(field.id, { visible: event.target.checked })
                        }
                        aria-label={`Toggle visibility for ${field.label || 'untitled'}`}
                      />
                      <span>{field.visible ? 'Visible in preview' : 'Hidden from preview'}</span>
                    </label>
                  </div>
                </article>
              )
            })}
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={onAddField}
            style={{ marginTop: '0.9rem' }}
            aria-label={`Add new field to ${title}`}
          >
            <FiPlus aria-hidden="true" />
            Add Field
          </button>
        </div>
      </div>
    </section>
  )
}

export default DynamicFieldEditor
