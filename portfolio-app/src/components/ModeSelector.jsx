import { FiBriefcase, FiHeart, FiGlobe, FiSliders } from 'react-icons/fi'

const modes = [
  { id: 'career', label: 'Career', desc: 'Professional focus', icon: FiBriefcase },
  { id: 'marriage', label: 'Marriage', desc: 'Personal proposal', icon: FiHeart },
  { id: 'general', label: 'General', desc: 'All-purpose profile', icon: FiGlobe },
  { id: 'custom', label: 'Custom', desc: 'Build your own', icon: FiSliders },
]

function ModeSelector({ selectedMode, onSelect }) {
  return (
    <section className="editor-card" aria-label="Portfolio mode selector">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Mode</p>
          <h2>Choose Portfolio Purpose</h2>
        </div>
      </div>
      <div className="mode-selector" role="radiogroup" aria-label="Portfolio mode">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = selectedMode === mode.id
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${mode.label} mode: ${mode.desc}`}
              className={`mode-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(mode.id)}
            >
              <Icon className="mode-icon" aria-hidden="true" />
              <span className="mode-label-wrap">
                <span className="mode-name">{mode.label}</span>
                <span className="mode-desc">{mode.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default ModeSelector
