const modes = [
  { id: 'career', label: 'Career' },
  { id: 'marriage', label: 'Marriage' },
  { id: 'general', label: 'General' },
  { id: 'custom', label: 'Custom' },
]

function ModeSelector({ selectedMode, onSelect }) {
  return (
    <section className="editor-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Mode</p>
          <h2>Choose Portfolio Purpose</h2>
        </div>
      </div>
      <div className="mode-selector">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-pill ${selectedMode === mode.id ? 'active' : ''}`}
            onClick={() => onSelect(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default ModeSelector
