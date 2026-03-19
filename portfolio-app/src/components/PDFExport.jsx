import { FiDownload } from 'react-icons/fi'

function PDFExport({ onExport, isExporting }) {
  return (
    <button type="button" className="primary-button" onClick={onExport} disabled={isExporting}>
      <FiDownload />
      {isExporting ? 'Preparing PDF...' : 'Download PDF'}
    </button>
  )
}

export default PDFExport
