import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import DynamicFieldEditor from './DynamicFieldEditor'

function CustomSectionBuilder({
  sections,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onRequestDeleteSection,
  onAddField,
  onUpdateField,
  onDeleteField,
  onRequestDeleteField,
  onReorderFields,
  searchQuery = '',
}) {
  return (
    <section className="custom-sections-wrap" aria-label="Custom sections">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Custom</p>
          <h2>Build Extra Sections</h2>
        </div>
      </div>
      <button
        type="button"
        className="primary-button"
        onClick={onAddSection}
        aria-label="Add a new custom section"
      >
        <FiPlus aria-hidden="true" />
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
                  title="Rename section"
                  aria-label={`Rename section ${section.title || 'Untitled'}`}
                >
                  <FiEdit2 aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => {
                    if (onRequestDeleteSection) {
                      onRequestDeleteSection(section.id, section.title)
                    } else {
                      onDeleteSection(section.id)
                    }
                  }}
                  title="Delete section"
                  aria-label={`Delete section ${section.title || 'Untitled'}`}
                >
                  <FiTrash2 aria-hidden="true" />
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
              onRequestDelete={
                onRequestDeleteField
                  ? (fieldId, label) => onRequestDeleteField(section.id, fieldId, label)
                  : undefined
              }
              onReorderFields={
                onReorderFields
                  ? (from, to) => onReorderFields(section.id, from, to)
                  : undefined
              }
              isRecommended={false}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default CustomSectionBuilder
