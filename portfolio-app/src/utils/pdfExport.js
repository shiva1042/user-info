import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportPreviewToPdf(previewElement, fileName) {
  if (!previewElement) {
    return
  }

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    windowWidth: previewElement.scrollWidth,
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
}
