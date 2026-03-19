import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FiPlus } from 'react-icons/fi'
import ModeSelector from './components/ModeSelector'
import TemplateSelector from './components/TemplateSelector'
import DynamicFieldEditor from './components/DynamicFieldEditor'
import CustomSectionBuilder from './components/CustomSectionBuilder'
import SectionRenderer from './components/SectionRenderer'
import PDFExport from './components/PDFExport'
import ProfileHeader from './components/ProfileHeader'
import defaultProfile from './data/defaultProfile'
import { templateConfig, templateMap } from './templates/templateConfig'
import { exportPreviewToPdf } from './utils/pdfExport'
import { loadPortfolioState, savePortfolioState } from './utils/storage'

const sectionMeta = {
  header: { title: 'Header Content' },
  basicInfo: { title: 'Basic Information' },
  about: { title: 'About & Vision' },
  career: { title: 'Career Highlights' },
  marriage: { title: 'Marriage Profile' },
}

const recommendedSectionsByMode = {
  career: ['header', 'basicInfo', 'about', 'career'],
  marriage: ['header', 'basicInfo', 'about', 'marriage'],
  general: ['header', 'basicInfo', 'about', 'career', 'marriage'],
  custom: ['header'],
}

const sectionOrderByMode = {
  career: ['header', 'basicInfo', 'career', 'about', 'marriage'],
  marriage: ['header', 'basicInfo', 'marriage', 'about', 'career'],
  general: ['header', 'basicInfo', 'about', 'career', 'marriage'],
  custom: ['header', 'basicInfo', 'about', 'career', 'marriage'],
}

function createEmptyField() {
  return {
    id: uuidv4(),
    label: '',
    value: '',
    visible: true,
    placeholder: 'Enter details',
    type: 'textarea',
  }
}

function App() {
  const [portfolioState, setPortfolioState] = useState(() =>
    loadPortfolioState(defaultProfile),
  )
  const [isExporting, setIsExporting] = useState(false)
  const previewRef = useRef(null)

  const { selectedMode, selectedTemplate, hideEmptyFields, profile } = portfolioState
  const activeTemplate = templateMap[selectedTemplate] || templateConfig[0]

  useEffect(() => {
    savePortfolioState(portfolioState)
  }, [portfolioState])

  const orderedSections = useMemo(() => {
    const order = sectionOrderByMode[selectedMode] || sectionOrderByMode.general

    return order.map((sectionKey) => ({
      key: sectionKey,
      title: sectionMeta[sectionKey].title,
      fields: profile[sectionKey] || [],
      recommended: recommendedSectionsByMode[selectedMode]?.includes(sectionKey),
    }))
  }, [profile, selectedMode])

  const previewSections = useMemo(() => {
    const baseSections = orderedSections
      .filter((section) => section.key !== 'header')
      .map((section) => {
        const fields = section.fields.filter((field) => {
          if (!field.visible) {
            return false
          }

          if (!hideEmptyFields) {
            return true
          }

          return field.value.trim() !== ''
        })

        return { ...section, fields }
      })
      .filter((section) => section.fields.length)

    const customSections = profile.customSections
      .map((section) => ({
        ...section,
        recommended: selectedMode === 'custom',
        fields: section.fields.filter((field) => {
          if (!field.visible) {
            return false
          }

          if (!hideEmptyFields) {
            return true
          }

          return field.value.trim() !== ''
        }),
      }))
      .filter((section) => section.fields.length)

    return [...baseSections, ...customSections]
  }, [hideEmptyFields, orderedSections, profile.customSections, selectedMode])

  function updateState(updater) {
    setPortfolioState((currentState) => updater(currentState))
  }

  function updateField(sectionKey, fieldId, updates) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        [sectionKey]: currentState.profile[sectionKey].map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field,
        ),
      },
    }))
  }

  function addField(sectionKey) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        [sectionKey]: [...currentState.profile[sectionKey], createEmptyField()],
      },
    }))
  }

  function deleteField(sectionKey, fieldId) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        [sectionKey]: currentState.profile[sectionKey].filter(
          (field) => field.id !== fieldId,
        ),
      },
    }))
  }

  function addCustomSection() {
    const sectionName = window.prompt('Enter section name', 'Achievements')

    if (sectionName === null) {
      return
    }

    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: [
          ...currentState.profile.customSections,
          {
            id: uuidv4(),
            title: sectionName.trim() || 'Untitled Section',
            visible: true,
            fields: [createEmptyField()],
          },
        ],
      },
    }))
  }

  function renameCustomSection(sectionId) {
    const target = profile.customSections.find((section) => section.id === sectionId)
    const nextTitle = window.prompt('Rename section', target?.title || 'Untitled Section')

    if (nextTitle === null) {
      return
    }

    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: currentState.profile.customSections.map((section) =>
          section.id === sectionId
            ? { ...section, title: nextTitle.trim() || 'Untitled Section' }
            : section,
        ),
      },
    }))
  }

  function deleteCustomSection(sectionId) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: currentState.profile.customSections.filter(
          (section) => section.id !== sectionId,
        ),
      },
    }))
  }

  function addFieldToCustomSection(sectionId) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: currentState.profile.customSections.map((section) =>
          section.id === sectionId
            ? { ...section, fields: [...section.fields, createEmptyField()] }
            : section,
        ),
      },
    }))
  }

  function updateCustomSectionField(sectionId, fieldId, updates) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: currentState.profile.customSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.map((field) =>
                  field.id === fieldId ? { ...field, ...updates } : field,
                ),
              }
            : section,
        ),
      },
    }))
  }

  function deleteCustomSectionField(sectionId, fieldId) {
    updateState((currentState) => ({
      ...currentState,
      profile: {
        ...currentState.profile,
        customSections: currentState.profile.customSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: section.fields.filter((field) => field.id !== fieldId),
              }
            : section,
        ),
      },
    }))
  }

  async function handleExportPdf() {
    if (!previewRef.current) {
      return
    }

    setIsExporting(true)

    try {
      await exportPreviewToPdf(previewRef.current, `portfolio-${selectedMode}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="editor-panel">
        <div className="editor-sticky">
          <div className="hero-panel">
            <p className="eyebrow">Universal Portfolio System</p>
            <h1>Build proposal-style profiles for career, marriage, general, or custom goals.</h1>
            <p className="hero-copy">
              Edit only what matters, skip irrelevant fields, switch templates instantly,
              and export the current presentation to PDF.
            </p>
          </div>

          <ModeSelector
            selectedMode={selectedMode}
            onSelect={(mode) =>
              updateState((currentState) => ({ ...currentState, selectedMode: mode }))
            }
          />

          <TemplateSelector
            templates={templateConfig}
            selectedTemplate={selectedTemplate}
            onSelect={(templateId) =>
              updateState((currentState) => ({
                ...currentState,
                selectedTemplate: templateId,
              }))
            }
          />

          <section className="editor-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Controls</p>
                <h2>Preview Preferences</h2>
              </div>
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={hideEmptyFields}
                onChange={(event) =>
                  updateState((currentState) => ({
                    ...currentState,
                    hideEmptyFields: event.target.checked,
                  }))
                }
              />
              <span>Hide empty fields from the live preview</span>
            </label>
          </section>

          {orderedSections.map((section) => (
            <DynamicFieldEditor
              key={section.key}
              title={section.title}
              fields={section.fields}
              isRecommended={section.recommended}
              onAddField={() => addField(section.key)}
              onUpdateField={(fieldId, updates) => updateField(section.key, fieldId, updates)}
              onDeleteField={(fieldId) => deleteField(section.key, fieldId)}
            />
          ))}

          <CustomSectionBuilder
            sections={profile.customSections}
            onAddSection={addCustomSection}
            onRenameSection={renameCustomSection}
            onDeleteSection={deleteCustomSection}
            onAddField={addFieldToCustomSection}
            onUpdateField={updateCustomSectionField}
            onDeleteField={deleteCustomSectionField}
          />
        </div>
      </aside>

      <main className="preview-panel">
        <div className="preview-toolbar">
          <div>
            <p className="eyebrow">Live Preview</p>
            <h2>{activeTemplate.name}</h2>
          </div>
          <div className="preview-toolbar-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => addField('about')}
            >
              <FiPlus />
              Quick Add Field
            </button>
            <PDFExport onExport={handleExportPdf} isExporting={isExporting} />
          </div>
        </div>

        <div
          ref={previewRef}
          className="portfolio-preview"
          style={{
            background: activeTemplate.background,
            color: activeTemplate.textColor,
            fontFamily: activeTemplate.fontFamily,
          }}
        >
          <div
            className="portfolio-preview-inner"
            style={{
              background: activeTemplate.cardBackground,
              borderColor: activeTemplate.dividerColor,
              boxShadow: `0 30px 80px ${activeTemplate.accentSoft}`,
              gap: activeTemplate.sectionGap,
            }}
          >
            <ProfileHeader
              headerFields={profile.header}
              basicInfo={profile.basicInfo}
              template={activeTemplate}
            />
            <div className="preview-sections">
              {previewSections.map((section) => (
                <SectionRenderer
                  key={section.id || section.key}
                  title={section.title}
                  fields={section.fields}
                  template={activeTemplate}
                  isRecommended={section.recommended}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
