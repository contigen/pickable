import { DashboardData } from './schema'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

export const cleanTextForPDF = (text: string) =>
  text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ''
  )

export const addPageBreakIfNeeded = (
  pdf: jsPDF,
  currentY: number,
  requiredSpace: number,
  margin: number
) => {
  const pageHeight = pdf.internal.pageSize.getHeight()
  if (currentY + requiredSpace > pageHeight - margin) {
    pdf.addPage()
    return margin
  }
  return currentY
}

export const captureChart = async (
  elementId: string
): Promise<string | null> => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      return null
    }

    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return null
    }

    const isVisible =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    if (!isVisible) {
      element.scrollIntoView({ behavior: 'auto', block: 'center' })
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      height: rect.height,
      width: rect.width,
    })

    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

export const generateDashboardPDF = async (
  dashboardData: DashboardData,
  setIsGenerating: (value: boolean) => void
) => {
  setIsGenerating(true)

  try {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin

    const reportName = cleanTextForPDF(
      dashboardData.reportName || 'Business Forecast Report'
    )
    const generatedAt = new Date().toLocaleDateString()

    pdf.setFillColor(46, 125, 50)
    pdf.rect(0, 0, pageWidth, 60, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.text(reportName, margin, 35)

    pdf.setFontSize(12)
    pdf.text(`Generated on ${generatedAt}`, margin, 45)

    let currentY = 80
    pdf.setFillColor(248, 249, 250)
    pdf.rect(margin, currentY, contentWidth, 40, 'F')
    pdf.setDrawColor(230, 230, 230)
    pdf.rect(margin, currentY, contentWidth, 40)

    pdf.setTextColor(40, 40, 40)
    pdf.setFontSize(14)
    pdf.text('Executive Summary', margin + 5, currentY + 10)

    pdf.setFontSize(10)
    const summaryText = cleanTextForPDF(dashboardData.forecastSummary.overview)
    const splitSummary = pdf.splitTextToSize(summaryText, contentWidth - 10)
    pdf.text(splitSummary, margin + 5, currentY + 18)

    currentY += 50
    pdf.setFillColor(76, 175, 80)
    pdf.rect(margin, currentY, 60, 15, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.text(
      `Confidence: ${dashboardData.forecastSummary.confidence}%`,
      margin + 5,
      currentY + 10
    )

    currentY += 30
    pdf.setTextColor(40, 40, 40)
    pdf.setFontSize(16)
    pdf.text('Key Performance Metrics', margin, currentY)

    currentY += 15
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, currentY, contentWidth, 10, 'F')
    pdf.setFontSize(10)
    pdf.setTextColor(60, 60, 60)
    pdf.text('Metric', margin + 5, currentY + 7)
    pdf.text('Current', margin + 60, currentY + 7)
    pdf.text('Forecast', margin + 100, currentY + 7)
    pdf.text('Change', margin + 140, currentY + 7)

    currentY += 10
    const metrics = [
      {
        name: 'Revenue',
        current: '$1.2M',
        forecast: '$1.8M',
        change: '+50%',
      },
      {
        name: 'Growth Rate',
        current: '15%',
        forecast: '25%',
        change: '+10%',
      },
      {
        name: 'Market Share',
        current: '12%',
        forecast: '18%',
        change: '+6%',
      },
    ]

    metrics.forEach((metric, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(margin, currentY, contentWidth, 8, 'F')
      }

      pdf.setTextColor(40, 40, 40)
      pdf.setFontSize(9)
      pdf.text(metric.name, margin + 5, currentY + 5)
      pdf.text(metric.current, margin + 60, currentY + 5)
      pdf.text(metric.forecast, margin + 100, currentY + 5)

      const isPositive = metric.change.startsWith('+')
      pdf.setTextColor(
        isPositive ? 76 : 244,
        isPositive ? 175 : 67,
        isPositive ? 80 : 54
      )
      pdf.text(metric.change, margin + 140, currentY + 5)

      currentY += 8
    })

    pdf.setFontSize(14)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Key Insights', margin, currentY)
    currentY += 10

    dashboardData.insights.forEach((insight, index: number) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage()
        currentY = margin
      }

      pdf.setFontSize(11)
      pdf.setTextColor(40, 40, 40)
      pdf.text(`${index + 1}. ${insight.title}`, margin, currentY)
      currentY += 7

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      const splitDescription = pdf.splitTextToSize(
        insight.description,
        pageWidth - 2 * margin - 10
      )
      pdf.text(splitDescription, margin + 5, currentY)
      currentY += splitDescription.length * 4 + 8
    })

    if (currentY > pageHeight - 60) {
      pdf.addPage()
      currentY = margin
    }

    pdf.setFontSize(14)
    pdf.setTextColor(40, 40, 40)
    pdf.text('Recommendations', margin, currentY)
    currentY += 10

    dashboardData.recommendations.forEach((rec, index: number) => {
      if (currentY > pageHeight - 30) {
        pdf.addPage()
        currentY = margin
      }

      pdf.setFontSize(11)
      pdf.setTextColor(40, 40, 40)
      pdf.text(`${index + 1}. ${rec.title}`, margin, currentY)
      currentY += 7

      pdf.setFontSize(9)
      pdf.setTextColor(80, 80, 80)
      const splitDesc = pdf.splitTextToSize(
        rec.description,
        pageWidth - 2 * margin - 10
      )
      pdf.text(splitDesc, margin + 5, currentY)
      currentY += splitDesc.length * 4 + 8
    })

    pdf.addPage()
    currentY = margin

    pdf.setTextColor(40, 40, 40)
    pdf.setFontSize(18)
    pdf.text('Detailed Business Insights', margin, currentY)
    currentY += 20

    dashboardData.smartInsights.forEach(insight => {
      currentY = addPageBreakIfNeeded(pdf, currentY, 40, margin)

      pdf.setFillColor(233, 247, 239)
      pdf.rect(margin, currentY, contentWidth, 12, 'F')

      pdf.setTextColor(40, 40, 40)
      pdf.setFontSize(12)
      pdf.text(`• ${cleanTextForPDF(insight.title)}`, margin + 5, currentY + 8)
      currentY += 15

      pdf.setFontSize(10)
      pdf.setTextColor(60, 60, 60)
      const splitDescription = pdf.splitTextToSize(
        cleanTextForPDF(insight.description || ''),
        contentWidth - 10
      )
      pdf.text(splitDescription, margin + 5, currentY)
      currentY += splitDescription.length * 4 + 10

      if (insight.value) {
        pdf.setFontSize(11)
        pdf.setTextColor(46, 125, 50)
        pdf.text(
          `Key Value: ${cleanTextForPDF(insight.value)}`,
          margin + 5,
          currentY
        )
        currentY += 8
      }

      currentY += 5
    })

    currentY = addPageBreakIfNeeded(pdf, currentY, 100, margin)

    pdf.setFillColor(46, 125, 50)
    pdf.rect(margin, currentY, contentWidth, 15, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.text('» Revenue Forecast Visualization', margin + 5, currentY + 10)
    currentY += 25

    await new Promise(resolve => setTimeout(resolve, 1000))

    const forecastChartImage = await captureChart('forecast-chart')

    if (
      forecastChartImage &&
      forecastChartImage !== 'data:,' &&
      forecastChartImage.length > 100
    ) {
      try {
        const imgWidth = contentWidth
        const imgHeight = (imgWidth * 3) / 4

        currentY = addPageBreakIfNeeded(pdf, currentY, imgHeight + 10, margin)

        pdf.addImage(
          forecastChartImage,
          'PNG',
          margin,
          currentY,
          imgWidth,
          imgHeight
        )
        currentY += imgHeight + 20
      } catch {
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text('Forecast chart could not be rendered', margin, currentY)
        currentY += 20
      }
    } else {
      pdf.setFontSize(10)
      pdf.setTextColor(150, 150, 150)
      pdf.text(
        'Forecast chart could not be captured. Make sure you are on the Overview tab',
        margin,
        currentY
      )
      pdf.text(
        'and the chart is fully loaded before generating the PDF.',
        margin,
        currentY + 10
      )
      currentY += 25
    }

    currentY = addPageBreakIfNeeded(pdf, currentY, 50, margin)

    pdf.setFillColor(252, 248, 227)
    pdf.rect(margin, currentY, contentWidth, 15, 'F')
    pdf.setTextColor(40, 40, 40)
    pdf.setFontSize(16)
    pdf.text('» Strategic Recommendations', margin + 5, currentY + 10)
    currentY += 25

    dashboardData.recommendations.forEach((rec, index) => {
      currentY = addPageBreakIfNeeded(pdf, currentY, 45, margin)

      pdf.setFillColor(252, 248, 227)
      pdf.rect(margin, currentY, contentWidth, 8, 'F')

      pdf.setTextColor(40, 40, 40)
      pdf.setFontSize(12)
      pdf.text(
        `${index + 1}. ${cleanTextForPDF(rec.title)}`,
        margin + 5,
        currentY + 6
      )
      currentY += 12

      pdf.setFontSize(10)
      pdf.setTextColor(60, 60, 60)
      const splitRecDescription = pdf.splitTextToSize(
        cleanTextForPDF(rec.description),
        contentWidth - 10
      )
      pdf.text(splitRecDescription, margin + 5, currentY)
      currentY += splitRecDescription.length * 4 + 5

      if (rec.priority) {
        const priorityColor =
          rec.priority === 'high'
            ? [244, 67, 54]
            : rec.priority === 'medium'
            ? [255, 152, 0]
            : [76, 175, 80]
        pdf.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2])
        pdf.setFontSize(9)
        pdf.text(
          `Priority: ${cleanTextForPDF(rec.priority)}`,
          margin + 5,
          currentY
        )
        currentY += 10
      }

      currentY += 5
    })

    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(
        `Page ${i} of ${totalPages} | ${reportName} | Generated ${generatedAt}`,
        margin,
        pageHeight - 10
      )
    }

    const fileName = `${reportName.replace(/\s+/g, '_')}_Detailed_${
      new Date().toISOString().split('T')[0]
    }.pdf`
    pdf.save(fileName)

    toast('Enhanced PDF Report Generated! 📊', {
      description:
        'Your detailed report with charts and insights has been downloaded.',
    })
  } catch (error) {
    toast('PDF Generation Failed', {
      description:
        error instanceof Error
          ? error.message
          : 'An error occurred while generating the PDF.',
    })
  } finally {
    setIsGenerating(false)
  }
}
