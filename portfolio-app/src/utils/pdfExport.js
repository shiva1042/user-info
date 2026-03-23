import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportPreviewToPdf(previewElement, fileName) {
  if (!previewElement) {
    return
  }

  // Clone the preview element into an off-screen container at fixed 900px width
  // This ensures consistent PDF output on both mobile and desktop
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;width:900px;z-index:-1;pointer-events:none;'
  document.body.appendChild(container)

  const clone = previewElement.cloneNode(true)
  clone.style.width = '900px'
  clone.style.minHeight = 'auto'
  clone.style.borderRadius = '0'
  clone.style.padding = '1.5rem'
  container.appendChild(clone)

  // Wait for layout to settle
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      width: 900,
      windowWidth: 900,
    })

    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imageWidth = pageWidth
    const imageHeight = (canvas.height * imageWidth) / canvas.width

    let remainingHeight = imageHeight
    let offsetY = 0

    pdf.addImage(imageData, 'PNG', 0, offsetY, imageWidth, imageHeight)
    remainingHeight -= pageHeight

    while (remainingHeight > 0) {
      offsetY = remainingHeight - imageHeight
      pdf.addPage()
      pdf.addImage(imageData, 'PNG', 0, offsetY, imageWidth, imageHeight)
      remainingHeight -= pageHeight
    }

    pdf.save(fileName)
    return true
  } finally {
    document.body.removeChild(container)
  }
}
