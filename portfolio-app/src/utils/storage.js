const STORAGE_KEY = 'universal-portfolio-system'

function mergeFieldArray(defaultFields = [], storedFields) {
  if (!Array.isArray(storedFields)) {
    return defaultFields
  }

  return storedFields
}

function mergeCustomSections(defaultSections = [], storedSections) {
  if (!Array.isArray(storedSections)) {
    return defaultSections
  }

  return storedSections.map((section) => ({
    ...section,
    fields: Array.isArray(section.fields) ? section.fields : [],
  }))
}

function mergePortfolioState(defaultState, storedState) {
  const storedProfile = storedState?.profile || {}
  const defaultProfile = defaultState.profile || {}

  return {
    ...defaultState,
    ...storedState,
    profile: {
      ...defaultProfile,
      ...storedProfile,
      header: mergeFieldArray(defaultProfile.header, storedProfile.header),
      basicInfo: mergeFieldArray(defaultProfile.basicInfo, storedProfile.basicInfo),
      about: mergeFieldArray(defaultProfile.about, storedProfile.about),
      career: mergeFieldArray(defaultProfile.career, storedProfile.career),
      marriage: mergeFieldArray(defaultProfile.marriage, storedProfile.marriage),
      customSections: mergeCustomSections(
        defaultProfile.customSections,
        storedProfile.customSections,
      ),
    },
  }
}

export function loadPortfolioState(defaultState) {
  if (typeof window === 'undefined') {
    return defaultState
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)

    if (!rawState) {
      return defaultState
    }

    return mergePortfolioState(defaultState, JSON.parse(rawState))
  } catch {
    return defaultState
  }
}

export function savePortfolioState(state) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
