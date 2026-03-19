function ProfileHeader({ headerFields, basicInfo, template }) {
  const badge = headerFields.find((field) => field.label.toLowerCase() === 'badge')
  const displayName = headerFields.find(
    (field) => field.label.toLowerCase() === 'display name',
  )
  const headline = headerFields.find((field) => field.label.toLowerCase() === 'headline')
  const sideNote = headerFields.find((field) => field.label.toLowerCase() === 'side note')
  const contactStrip = headerFields.find(
    (field) => field.label.toLowerCase() === 'contact strip',
  )
  const fallbackName = basicInfo.find((field) => field.label.toLowerCase() === 'full name')

  const contact = (contactStrip?.value || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <header
      className={`profile-header profile-header-${template.headerLayout}`}
      style={{ borderColor: template.dividerColor }}
    >
      <div>
        {badge?.visible && badge.value ? <p className="preview-label">{badge.value}</p> : null}
        {(displayName?.visible && displayName.value) || fallbackName?.value ? (
          <h1>
            {displayName?.visible && displayName.value
              ? displayName.value
              : fallbackName?.value || ''}
          </h1>
        ) : null}
        {headline?.visible && headline.value ? (
          <p className="preview-subtitle">{headline.value}</p>
        ) : null}
      </div>
      <div className="profile-header-side">
        {sideNote?.visible && sideNote.value ? <p>{sideNote.value}</p> : null}
        {contact.length ? (
          <ul className="contact-chip-list">
            {contact.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  )
}

export default ProfileHeader
