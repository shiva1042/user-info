import { FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi'

function DynamicFieldEditor({
  title,
  fields = [],
  onUpdateField,
  onDeleteField,
  onAddField,
  isRecommended,
}) {
  return (
    <section className="editor-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Section</p>
          <h2>{title}</h2>
        </div>
        {isRecommended ? <span className="panel-meta highlighted">Recommended now</span> : null}
      </div>
      <div className="field-stack">
        {fields.map((field) => (
          <article key={field.id} className="field-card">
            <div className="field-card-top">
              <label>
                <span>Label</span>
                <input
                  type="text"
                  value={field.label}
                  placeholder="Field name"
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
                  title={field.visible ? 'Hide' : 'Show'}
                >
                  {field.visible ? <FiEyeOff /> : <FiEye />}
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => onDeleteField(field.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <label>
              <span>Value</span>
              <textarea
                rows="3"
                value={field.value}
                placeholder={field.placeholder || 'Enter details'}
                onChange={(event) =>
                  onUpdateField(field.id, { value: event.target.value, type: 'textarea' })
                }
              />
            </label>
            <div className="field-card-footer">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={field.visible}
                  onChange={(event) =>
                    onUpdateField(field.id, { visible: event.target.checked })
                  }
                />
                <span>{field.visible ? 'Visible in preview' : 'Hidden from preview'}</span>
              </label>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="secondary-button" onClick={onAddField}>
        <FiPlus />
        Add Field
      </button>
    </section>
  )
}

export default DynamicFieldEditor
