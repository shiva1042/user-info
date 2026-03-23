import { FiDownload } from 'react-icons/fi'

function PDFExport({ onExport, isExporting }) {
  return (
    <>
      <button
        type="button"
        className="primary-button"
        onClick={onExport}
        disabled={isExporting}
        aria-label={isExporting ? 'PDF is being generated' : 'Download portfolio as PDF'}
        aria-busy={isExporting}
      >
        <FiDownload aria-hidden="true" />
        {isExporting ? 'Preparing PDF...' : 'Download PDF'}
      </button>

      {isExporting ? (
        <div className="pdf-export-overlay" role="status" aria-label="Generating PDF">
          <div className="pdf-export-modal">
            <div className="spinner" aria-hidden="true" />
            <p>Generating PDF</p>
            <span>Optimizing for print quality...</span>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default PDFExport
