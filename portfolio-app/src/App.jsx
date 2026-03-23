import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  FiPlus,
  FiEdit3,
  FiEye,
  FiArrowUp,
  FiCheck,
  FiAlertCircle,
  FiMoon,
  FiSun,
  FiRotateCcw,
  FiRotateCw,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiSearch,
  FiX,
  FiUser,
  FiCamera,
  FiTrash2,
} from 'react-icons/fi'
import ModeSelector from './components/ModeSelector'
import TemplateSelector from './components/TemplateSelector'
import DynamicFieldEditor from './components/DynamicFieldEditor'
import CustomSectionBuilder from './components/CustomSectionBuilder'
import SectionRenderer from './components/SectionRenderer'
import PDFExport from './components/PDFExport'
import ProfileHeader from './components/ProfileHeader'
import ConfirmDialog from './components/ConfirmDialog'
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

const MAX_HISTORY = 30

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
  const [activeTab, setActiveTab] = useState('editor')
  const [toasts, setToasts] = useState([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('portfolio-dark-mode') === 'true'
    } catch {
      return false
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [sectionWidths, setSectionWidths] = useState({})

  // Undo/Redo
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const skipHistoryRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const previewRef = useRef(null)
  const fileInputRef = useRef(null)

  const { selectedMode, selectedTemplate, hideEmptyFields, profile, profilePhoto } = portfolioState
  const activeTemplate = templateMap[selectedTemplate] || templateConfig[0]

  // Auto-detect mobile
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1080)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 1080)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Scroll detection
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Dark mode class on body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
    try {
      localStorage.setItem('portfolio-dark-mode', darkMode)
    } catch { /* ignore */ }
  }, [darkMode])

  // Save state & auto-save indicator
  useEffect(() => {
    savePortfolioState(portfolioState)
    setAutoSaveStatus('saved')
    const timer = setTimeout(() => setAutoSaveStatus(null), 2000)
    return () => clearTimeout(timer)
  }, [portfolioState])

  // Push to undo history
  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false
      return
    }
    const history = historyRef.current
    const index = historyIndexRef.current

    // Truncate future states
    historyRef.current = history.slice(0, index + 1)
    historyRef.current.push(JSON.parse(JSON.stringify(portfolioState)))
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }
    historyIndexRef.current = historyRef.current.length - 1
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [portfolioState])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const isMeta = e.ctrlKey || e.metaKey

      // Ctrl+Z = Undo
      if (isMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }

      // Ctrl+Shift+Z or Ctrl+Y = Redo
      if (isMeta && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
        return
      }

      // Ctrl+E = Export PDF
      if (isMeta && e.key === 'e') {
        e.preventDefault()
        handleExportPdf()
        return
      }

      // Ctrl+P on mobile = toggle preview
      if (isMeta && e.key === 'p' && isMobile) {
        e.preventDefault()
        setActiveTab((prev) => (prev === 'editor' ? 'preview' : 'editor'))
        return
      }

      // Ctrl+D = toggle dark mode
      if (isMeta && e.key === 'd') {
        e.preventDefault()
        setDarkMode((prev) => !prev)
        return
      }

      // Escape = close dialogs / clear search
      if (e.key === 'Escape') {
        if (confirmDialog) {
          setConfirmDialog(null)
        } else if (searchQuery) {
          setSearchQuery('')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    const id = uuidv4()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  // Progress calculation
  const progress = useMemo(() => {
    const allFields = [
      ...profile.header,
      ...profile.basicInfo,
      ...profile.about,
      ...profile.career,
      ...profile.marriage,
      ...profile.customSections.flatMap((s) => s.fields),
    ]
    const filled = allFields.filter((f) => f.value.trim()).length
    return allFields.length > 0 ? Math.round((filled / allFields.length) * 100) : 0
  }, [profile])

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
          if (!field.visible) return false
          if (!hideEmptyFields) return true
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
          if (!field.visible) return false
          if (!hideEmptyFields) return true
          return field.value.trim() !== ''
        }),
      }))
      .filter((section) => section.fields.length)

    return [...baseSections, ...customSections]
  }, [hideEmptyFields, orderedSections, profile.customSections, selectedMode])

  // ─── State Updaters ─────────────────────────────
  function updateState(updater) {
    setPortfolioState((currentState) => updater(currentState))
  }

  function updateField(sectionKey, fieldId, updates) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        [sectionKey]: s.profile[sectionKey].map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f,
        ),
      },
    }))
  }

  function addField(sectionKey) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        [sectionKey]: [...s.profile[sectionKey], createEmptyField()],
      },
    }))
  }

  function deleteField(sectionKey, fieldId) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        [sectionKey]: s.profile[sectionKey].filter((f) => f.id !== fieldId),
      },
    }))
  }

  function reorderFields(sectionKey, fromIndex, toIndex) {
    updateState((s) => {
      const arr = [...s.profile[sectionKey]]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      return { ...s, profile: { ...s.profile, [sectionKey]: arr } }
    })
  }

  // ─── Custom Sections ────────────────────────────
  function addCustomSection() {
    const sectionName = window.prompt('Enter section name', 'Achievements')
    if (sectionName === null) return
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: [
          ...s.profile.customSections,
          {
            id: uuidv4(),
            title: sectionName.trim() || 'Untitled Section',
            visible: true,
            fields: [createEmptyField()],
          },
        ],
      },
    }))
    showToast('Section added')
  }

  function renameCustomSection(sectionId) {
    const target = profile.customSections.find((s) => s.id === sectionId)
    const nextTitle = window.prompt('Rename section', target?.title || 'Untitled Section')
    if (nextTitle === null) return
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, title: nextTitle.trim() || 'Untitled Section' }
            : sec,
        ),
      },
    }))
  }

  function deleteCustomSection(sectionId) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.filter((sec) => sec.id !== sectionId),
      },
    }))
    showToast('Section removed')
  }

  function addFieldToCustomSection(sectionId) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, fields: [...sec.fields, createEmptyField()] }
            : sec,
        ),
      },
    }))
  }

  function updateCustomSectionField(sectionId, fieldId, updates) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                fields: sec.fields.map((f) =>
                  f.id === fieldId ? { ...f, ...updates } : f,
                ),
              }
            : sec,
        ),
      },
    }))
  }

  function deleteCustomSectionField(sectionId, fieldId) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) }
            : sec,
        ),
      },
    }))
  }

  function reorderCustomSectionFields(sectionId, fromIndex, toIndex) {
    updateState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        customSections: s.profile.customSections.map((sec) => {
          if (sec.id !== sectionId) return sec
          const arr = [...sec.fields]
          const [moved] = arr.splice(fromIndex, 1)
          arr.splice(toIndex, 0, moved)
          return { ...sec, fields: arr }
        }),
      },
    }))
  }

  // ─── Undo / Redo ────────────────────────────────
  function handleUndo() {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    skipHistoryRef.current = true
    const state = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]))
    setPortfolioState(state)
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
    showToast('Undone')
  }

  function handleRedo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    skipHistoryRef.current = true
    const state = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]))
    setPortfolioState(state)
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
    showToast('Redone')
  }

  // ─── Reset to Defaults ──────────────────────────
  function handleReset() {
    setConfirmDialog({
      title: 'Reset to Defaults',
      message: 'This will erase all your changes and restore the original profile data. This cannot be undone.',
      confirmLabel: 'Reset Everything',
      variant: 'danger',
      onConfirm: () => {
        setPortfolioState(JSON.parse(JSON.stringify(defaultProfile)))
        setSectionWidths({})
        setConfirmDialog(null)
        showToast('Reset to defaults')
      },
    })
  }

  // ─── Delete Confirmation Helpers ────────────────
  function requestDeleteField(sectionKey, fieldId, label) {
    setConfirmDialog({
      title: 'Delete Field',
      message: `Are you sure you want to delete "${label || 'Untitled'}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        deleteField(sectionKey, fieldId)
        setConfirmDialog(null)
        showToast('Field deleted')
      },
    })
  }

  function requestDeleteCustomSection(sectionId, title) {
    setConfirmDialog({
      title: 'Delete Section',
      message: `Are you sure you want to delete the "${title || 'Untitled'}" section and all its fields?`,
      confirmLabel: 'Delete Section',
      variant: 'danger',
      onConfirm: () => {
        deleteCustomSection(sectionId)
        setConfirmDialog(null)
      },
    })
  }

  function requestDeleteCustomField(sectionId, fieldId, label) {
    setConfirmDialog({
      title: 'Delete Field',
      message: `Are you sure you want to delete "${label || 'Untitled'}"?`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: () => {
        deleteCustomSectionField(sectionId, fieldId)
        setConfirmDialog(null)
        showToast('Field deleted')
      },
    })
  }

  // ─── PDF Export ─────────────────────────────────
  async function handleExportPdf() {
    if (!previewRef.current) return
    setIsExporting(true)
    try {
      const success = await exportPreviewToPdf(
        previewRef.current,
        `portfolio-${selectedMode}.pdf`,
      )
      if (success) showToast('PDF downloaded successfully!')
    } catch {
      showToast('Failed to generate PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  // ─── Import / Export JSON ───────────────────────
  function handleExportJson() {
    const data = JSON.stringify(portfolioState, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${selectedMode}-backup.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('JSON backup exported')
  }

  function handleImportJson(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed && parsed.profile) {
          setPortfolioState(parsed)
          showToast('Profile imported successfully')
        } else {
          showToast('Invalid portfolio file', 'error')
        }
      } catch {
        showToast('Failed to parse file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ─── Profile Photo ──────────────────────────────
  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Photo must be under 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      updateState((s) => ({ ...s, profilePhoto: event.target.result }))
      showToast('Profile photo updated')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function removePhoto() {
    updateState((s) => ({ ...s, profilePhoto: null }))
    showToast('Photo removed')
  }

  // ─── Section Width Toggle ───────────────────────
  function toggleSectionWidth(key) {
    setSectionWidths((prev) => ({
      ...prev,
      [key]: prev[key] === 'full' ? 'half' : 'full',
    }))
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ─── Render ─────────────────────────────────────
  const editorContent = (
    <aside
      className={`editor-panel ${isMobile && activeTab !== 'editor' ? 'hidden-mobile' : ''}`}
      aria-label="Portfolio editor"
    >
      <div className="editor-sticky">
        <div className="hero-panel">
          <p className="eyebrow">Universal Portfolio System</p>
          <h1>Build proposal-style profiles for career, marriage, general, or custom goals.</h1>
          <p className="hero-copy">
            Edit only what matters, skip irrelevant fields, switch templates instantly,
            and export the current presentation to PDF.
          </p>
        </div>

        {/* Toolbar Row */}
        <div className="toolbar-row" data-no-print role="toolbar" aria-label="Editor actions">
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last change"
            >
              <FiRotateCcw aria-hidden="true" /> Undo
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo last change"
            >
              <FiRotateCw aria-hidden="true" /> Redo
            </button>
            <div className="toolbar-divider" />
            <button
              type="button"
              className={`toolbar-btn${darkMode ? ' active' : ''}`}
              onClick={() => setDarkMode((d) => !d)}
              title="Toggle dark mode (Ctrl+D)"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            </button>
          </div>
          <div className="toolbar-group">
            {autoSaveStatus === 'saved' ? (
              <span className="autosave-indicator" aria-live="polite">
                <FiCheck aria-hidden="true" /> Saved
              </span>
            ) : null}
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleExportJson}
              title="Export profile as JSON"
              aria-label="Export profile data as JSON file"
            >
              <FiDownload aria-hidden="true" /> JSON
            </button>
            <label className="toolbar-btn" title="Import profile from JSON" aria-label="Import profile from JSON file" tabIndex={0}>
              <FiUpload aria-hidden="true" /> Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                style={{ display: 'none' }}
              />
            </label>
            <div className="toolbar-divider" />
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleReset}
              title="Reset to defaults"
              aria-label="Reset all data to defaults"
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
          <div className="progress-bar-header">
            <span>Profile Completion</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Profile Photo Upload */}
        <div className="editor-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Photo</p>
              <h2>Profile Picture</h2>
            </div>
          </div>
          <div className="avatar-upload-section">
            {profilePhoto ? (
              <img className="avatar-preview" src={profilePhoto} alt="Profile photo preview" />
            ) : (
              <div className="avatar-placeholder" aria-hidden="true">
                <FiUser />
              </div>
            )}
            <div className="avatar-upload-actions">
              <label tabIndex={0} aria-label="Upload profile photo">
                <FiCamera aria-hidden="true" />
                {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoUpload}
                />
              </label>
              {profilePhoto ? (
                <button type="button" onClick={removePhoto} aria-label="Remove profile photo">
                  <FiTrash2 aria-hidden="true" /> Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <FiSearch className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search fields by label or value"
          />
          {searchQuery ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <FiX aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <ModeSelector
          selectedMode={selectedMode}
          onSelect={(mode) => {
            updateState((s) => ({ ...s, selectedMode: mode }))
            showToast(`Switched to ${mode} mode`)
          }}
        />

        <TemplateSelector
          templates={templateConfig}
          selectedTemplate={selectedTemplate}
          onSelect={(templateId) => {
            updateState((s) => ({ ...s, selectedTemplate: templateId }))
            const tmpl = templateMap[templateId]
            if (tmpl) showToast(`Template: ${tmpl.name}`)
          }}
        />

        <section className="editor-card" aria-label="Preview preferences">
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
                updateState((s) => ({ ...s, hideEmptyFields: event.target.checked }))
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
            onRequestDelete={(fieldId, label) => requestDeleteField(section.key, fieldId, label)}
            onReorderFields={(from, to) => reorderFields(section.key, from, to)}
            searchQuery={searchQuery}
          />
        ))}

        <CustomSectionBuilder
          sections={profile.customSections}
          onAddSection={addCustomSection}
          onRenameSection={renameCustomSection}
          onDeleteSection={deleteCustomSection}
          onRequestDeleteSection={requestDeleteCustomSection}
          onAddField={addFieldToCustomSection}
          onUpdateField={updateCustomSectionField}
          onDeleteField={deleteCustomSectionField}
          onRequestDeleteField={requestDeleteCustomField}
          onReorderFields={reorderCustomSectionFields}
          searchQuery={searchQuery}
        />

        {/* Keyboard Shortcuts */}
        <div className="editor-card" style={{ padding: '1rem' }} aria-label="Keyboard shortcuts reference">
          <div className="panel-heading" style={{ marginBottom: '0.5rem' }}>
            <div>
              <p className="eyebrow">Shortcuts</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span><span className="kbd">Ctrl+Z</span> Undo</span>
            <span><span className="kbd">Ctrl+Shift+Z</span> Redo</span>
            <span><span className="kbd">Ctrl+E</span> Export PDF</span>
            <span><span className="kbd">Ctrl+D</span> Dark Mode</span>
            <span><span className="kbd">Esc</span> Close / Clear</span>
          </div>
        </div>
      </div>
    </aside>
  )

  const previewContent = (
    <main
      className={`preview-panel ${isMobile && activeTab !== 'preview' ? 'hidden-mobile' : ''}`}
      aria-label="Portfolio preview"
    >
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
            aria-label="Add field to About section"
          >
            <FiPlus aria-hidden="true" />
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
            profilePhoto={profilePhoto}
          />

          {previewSections.length > 0 ? (
            <div className="preview-sections">
              {previewSections.map((section) => {
                const key = section.id || section.key
                return (
                  <SectionRenderer
                    key={key}
                    title={section.title}
                    fields={section.fields}
                    template={activeTemplate}
                    isRecommended={section.recommended}
                    isFullWidth={sectionWidths[key] === 'full'}
                    onToggleWidth={() => toggleSectionWidth(key)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <div className="empty-state-icon" aria-hidden="true">
                <FiEye />
              </div>
              <p>No sections to display yet.</p>
              <p>Start editing fields or switch to a different mode.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )

  return (
    <>
      {/* Mobile Tab Bar */}
      {isMobile ? (
        <nav className="mobile-tab-bar" aria-label="View switcher">
          <button
            type="button"
            className={`mobile-tab ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
            aria-label="Switch to editor view"
            aria-current={activeTab === 'editor' ? 'true' : undefined}
          >
            <FiEdit3 aria-hidden="true" />
            Editor
          </button>
          <button
            type="button"
            className={`mobile-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('preview')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            aria-label="Switch to preview view"
            aria-current={activeTab === 'preview' ? 'true' : undefined}
          >
            <FiEye aria-hidden="true" />
            Preview
            {previewSections.length > 0 ? (
              <span className="tab-badge">{previewSections.length}</span>
            ) : null}
          </button>
        </nav>
      ) : null}

      <div className="app-shell">
        {editorContent}
        {previewContent}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog ? (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      ) : null}

      {/* Toast Notifications */}
      {toasts.length > 0 ? (
        <div className="toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
              {toast.type === 'success' ? <FiCheck aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}

      {/* Scroll to Top */}
      {showScrollTop ? (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={scrollToTop}
          title="Scroll to top"
          aria-label="Scroll to top of page"
        >
          <FiArrowUp aria-hidden="true" />
        </button>
      ) : null}
    </>
  )
}

export default App
