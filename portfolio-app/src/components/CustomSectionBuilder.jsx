import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import DynamicFieldEditor from './DynamicFieldEditor'

function CustomSectionBuilder({
  sections,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onAddField,
  onUpdateField,
  onDeleteField,
}) {
  return (
    <section className="custom-sections-wrap">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Custom</p>
          <h2>Build Extra Sections</h2>
        </div>
      </div>
      <button type="button" className="primary-button" onClick={onAddSection}>
        <FiPlus />
        Add Section
      </button>
      <div className="custom-sections-list">
        {sections.map((section) => (
          <div key={section.id} className="custom-section-block">
            <div className="custom-section-toolbar">
              <strong>{section.title || 'Untitled Section'}</strong>
              <div className="field-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onRenameSection(section.id)}
                  title="Rename"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => onDeleteSection(section.id)}
                  title="Delete section"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <DynamicFieldEditor
              title={section.title || 'Untitled Section'}
              fields={section.fields}
              onAddField={() => onAddField(section.id)}
              onUpdateField={(fieldId, updates) =>
                onUpdateField(section.id, fieldId, updates)
              }
              onDeleteField={(fieldId) => onDeleteField(section.id, fieldId)}
              isRecommended={false}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default CustomSectionBuilder
