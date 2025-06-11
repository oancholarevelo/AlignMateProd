import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatDateForPDF = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTimeForPDF = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to convert hex to RGB array for jsPDF
const hexToRgb = (hex) => {
  if (!hex) return [0, 0, 0]; // Default to black if hex is undefined
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0]; // Default to black on parse error
};

export const generateDailyReportPDF = async (reportData) => {
  const {
    userName,
    reportDate,
    postureData = [],
    mlData = [],
    aggregatedData = [],
    goodPosturePercentage,
    badPosturePercentage,
    // For comparison feature, you would need to pass data like:
    // previousDaySummary: { goodPosturePercentage: 70, badPosturePercentage: 30 },
    // previousWeekAverage: { goodPosturePercentage: 65, badPosturePercentage: 35 },
  } = reportData;

  const PDF_THEME = {
    primary: "#5CA377",
    text: "#1B1212",
    textLight: "#666666",
    background: "#FAF9F6", // Not directly used in PDF, but good for reference
    white: "#FFFFFF",
    danger: "#F87A53",
    warning: "#FFA500",
    border: "#D0D0D0", // Slightly softer border
    lightGray: "#F0F0F0", // For alternating rows
  };

  const PRIMARY_COLOR_RGB = hexToRgb(PDF_THEME.primary);
  const TEXT_COLOR_RGB = hexToRgb(PDF_THEME.text);
  const TEXT_LIGHT_COLOR_RGB = hexToRgb(PDF_THEME.textLight);
  const WHITE_RGB = hexToRgb(PDF_THEME.white);
  const DANGER_RGB = hexToRgb(PDF_THEME.danger);
  const WARNING_RGB = hexToRgb(PDF_THEME.warning);
  const BORDER_COLOR_RGB = hexToRgb(PDF_THEME.border);
  const LIGHT_GRAY_RGB = hexToRgb(PDF_THEME.lightGray);

  const doc = new jsPDF();
  let yPos = 0;
  let mostFrequentPrediction = "N/A"; // Declare and initialize here

  const drawHeader = () => {
    const headerHeight = 25;
    doc.setFillColor(...PRIMARY_COLOR_RGB);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), headerHeight, "F");

    doc.setFontSize(18);
    doc.setTextColor(...WHITE_RGB);
    doc.setFont("helvetica", "bold");
    doc.text(
      "AlignMate Daily Posture Report",
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    yPos = headerHeight + 12; // Increased spacing after header

    doc.setFontSize(11);
    doc.setTextColor(...TEXT_COLOR_RGB);
    doc.setFont("helvetica", "normal");
    doc.text(`User: ${userName || "N/A"}`, 14, yPos);
    doc.text(
      `Date: ${reportDate ? formatDateForPDF(reportDate) : "N/A"}`,
      doc.internal.pageSize.getWidth() - 14,
      yPos,
      { align: "right" }
    );
    yPos += 7; // Adjusted spacing
    doc.setDrawColor(...BORDER_COLOR_RGB);
    doc.setLineWidth(0.2);
    doc.line(14, yPos, doc.internal.pageSize.getWidth() - 14, yPos);
    yPos += 10; // Increased spacing after line
  };
  drawHeader();

  const drawSectionTitle = (title) => {
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      // Adjusted page break check
      doc.addPage();
      drawHeader();
    }
    doc.setFontSize(15); // Slightly smaller for section titles
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY_COLOR_RGB); // Use primary color for section titles
    doc.text(title, 14, yPos);
    yPos += 6;
    doc.setDrawColor(...BORDER_COLOR_RGB);
    doc.setLineWidth(0.1);
    doc.line(14, yPos, doc.internal.pageSize.getWidth() - 14, yPos); // Line under title
    yPos += 8; // Spacing after line
  };

  // --- Daily Summary Section ---
  drawSectionTitle("Daily Summary");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_COLOR_RGB);

  const summaryLineHeight = 7;
  doc.text(`Good Posture: `, 14, yPos);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR_RGB);
  doc.text(
    `${
      typeof goodPosturePercentage === "number"
        ? goodPosturePercentage.toFixed(1)
        : "N/A"
    }%`,
    45,
    yPos
  );
  yPos += summaryLineHeight;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_COLOR_RGB);
  doc.text(`Poor/Warning Posture: `, 14, yPos);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DANGER_RGB);
  doc.text(
    `${
      typeof badPosturePercentage === "number"
        ? badPosturePercentage.toFixed(1)
        : "N/A"
    }%`,
    60,
    yPos
  );
  yPos += summaryLineHeight;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_COLOR_RGB);
  doc.text(`Total Posture Readings: ${postureData.length}`, 14, yPos);
  yPos += summaryLineHeight;
  doc.text(`Total ML Classifications: ${mlData.length}`, 14, yPos);
  yPos += 12;

  // --- Machine Learning Insights ---
  if (mlData.length > 0) {
    drawSectionTitle("Machine Learning Insights");
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_COLOR_RGB);

    const predictions = mlData.map((item) => item.prediction || "Unknown"); // Handle undefined predictions
    const predictionCounts = predictions.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    // mostFrequentPrediction = "N/A"; // Remove declaration from here
    let maxCount = 0;
    for (const pred in predictionCounts) {
      if (predictionCounts[pred] > maxCount) {
        mostFrequentPrediction = pred; // Assign to the higher-scoped variable
        maxCount = predictionCounts[pred];
      }
    }

    const totalConfidence = mlData.reduce(
      (acc, curr) => acc + (curr.confidence || 0),
      0
    );
    const averageConfidence =
      mlData.length > 0
        ? ((totalConfidence / mlData.length) * 100).toFixed(1)
        : "N/A";

    doc.text(`Most Frequent Classification: `, 14, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`${mostFrequentPrediction} (${maxCount} times)`, 70, yPos);
    yPos += summaryLineHeight;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_COLOR_RGB);
    doc.text(`Average Prediction Confidence: `, 14, yPos);
    doc.setFont("helvetica", "bold");
    doc.text(`${averageConfidence}%`, 75, yPos);
    yPos += summaryLineHeight;

    // Full ML Prediction Breakdown
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_COLOR_RGB);
    doc.text("Classification Counts:", 14, yPos);
    yPos += summaryLineHeight;
    const categories = ["Good", "Warning", "Bad", "Unknown"]; // Define order for display
    categories.forEach((cat) => {
      if (predictionCounts[cat]) {
        doc.setFont("helvetica", "normal");
        doc.text(`  • ${cat}: `, 18, yPos);
        doc.setFont("helvetica", "bold");
        doc.text(`${predictionCounts[cat]} times`, 50, yPos);
        yPos += summaryLineHeight;
      }
    });
    yPos += 6; // Extra spacing after this sub-section
  }

  // --- Comparison to Previous Periods (Placeholder) ---
  // This section requires data like 'previousDaySummary' or 'previousWeekAverage'
  // to be passed in the 'reportData' object from PostureGraph.js
  if (reportData.previousDaySummary || reportData.previousWeekAverage) {
    drawSectionTitle("Performance Trends");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_COLOR_RGB);

    if (
      reportData.previousDaySummary &&
      typeof goodPosturePercentage === "number"
    ) {
      const prevGood = reportData.previousDaySummary.goodPosturePercentage;
      if (typeof prevGood === "number") {
        const diff = goodPosturePercentage - prevGood;
        doc.text(`Compared to Previous Day (Good Posture): `, 14, yPos);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(diff >= 0 ? PRIMARY_COLOR_RGB : DANGER_RGB);
        doc.text(`${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`, 85, yPos);
        yPos += summaryLineHeight;
        doc.setTextColor(...TEXT_COLOR_RGB); // Reset color
      }
    }
    // Add similar logic for previousWeekAverage if data is available
    // Example:
    // if (reportData.previousWeekAverage && typeof goodPosturePercentage === 'number') {
    //     const prevWeekGood = reportData.previousWeekAverage.goodPosturePercentage;
    //     if (typeof prevWeekGood === 'number') {
    //         const diffWeek = goodPosturePercentage - prevWeekGood;
    //         doc.text(`Compared to Last Week Avg (Good Posture): `, 14, yPos);
    //         doc.setFont("helvetica", "bold");
    //         doc.setTextColor(diffWeek >= 0 ? PRIMARY_COLOR_RGB : DANGER_RGB);
    //         doc.text(`${diffWeek >= 0 ? '+' : ''}${diffWeek.toFixed(1)}%`, 95, yPos);
    //         yPos += summaryLineHeight;
    //         doc.setTextColor(...TEXT_COLOR_RGB); // Reset color
    //     }
    // }
    yPos += 6;
  }

  // --- Aggregated Data (Hourly Averages) ---
  if (aggregatedData.length > 0) {
    drawSectionTitle("Hourly Posture Breakdown");
    const tableColumn = ["Period", "Avg. Pitch (°)", "Data Points"];
    const tableRows = aggregatedData.map((item) => {
      const averageValue =
        typeof item.value === "number" ? item.value.toFixed(1) : "N/A";
      return [item.label, averageValue, item.dataCount || 0];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: "grid",
      headStyles: {
        fillColor: PRIMARY_COLOR_RGB,
        textColor: WHITE_RGB,
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      styles: {
        cellPadding: 2.5,
        fontSize: 9.5,
        lineColor: BORDER_COLOR_RGB,
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: LIGHT_GRAY_RGB,
      },
      margin: { left: 14, right: 14 },
      tableWidth: "auto", // REMOVE THE didDrawPage HOOK HERE // didDrawPage: (data) => { //   if (data.pageNumber > 1 && data.cursor.y < yPos && data.cursor.y < 60) { //       drawHeader(); // } // }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  } else {
    if (yPos > doc.internal.pageSize.getHeight() - 30) doc.addPage();
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_LIGHT_COLOR_RGB);
    doc.text("No aggregated hourly data available for this day.", 14, yPos);
    yPos += 12; // Increased spacing
  }

  // --- Detailed Posture Log ---
  if (postureData.length > 0) {
    drawSectionTitle("Recent Posture Log Entries");
    const maxEntriesToShow = 20;
    const dataToDisplay = postureData.slice(-maxEntriesToShow);

    doc.setFontSize(9);
    doc.setTextColor(...TEXT_LIGHT_COLOR_RGB);
    doc.text(`Showing last ${dataToDisplay.length} of ${postureData.length} entries.`, 14, yPos);
    yPos += 7;

    const logColumns = ["Time", "Pitch (°)", "Raw Val", "ML Prediction", "Confidence (%)"];
    const mlDataMap = new Map(mlData.map(item => [item.timestamp, item]));
    const logRows = dataToDisplay.map(log => {
      const mlEntry = mlDataMap.get(log.timestamp);
      const prediction = mlEntry ? mlEntry.prediction : "N/A";
      const confidence = mlEntry && mlEntry.confidence ? (mlEntry.confidence * 100).toFixed(0) : "N/A";
      return [
        log.hour ? formatTimeForPDF(new Date(log.hour)) : 'N/A',
        log.pitch !== undefined ? log.pitch.toFixed(1) : 'N/A',
        log.rawValue !== undefined ? log.rawValue : 'N/A',
        prediction,
        confidence
      ];
    });

    autoTable(doc, {
      head: [logColumns],
      body: logRows,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: PRIMARY_COLOR_RGB,
        textColor: WHITE_RGB,
        fontStyle: 'bold',
        fontSize: 9.5,
        halign: 'center'
      },
      styles: {
        cellPadding: 2,
        fontSize: 8.5,
        lineColor: BORDER_COLOR_RGB,
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: LIGHT_GRAY_RGB
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 'auto', halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
      // REMOVE THE didDrawPage HOOK HERE
      // didDrawPage: (data) => {
      //    if (data.pageNumber > 1 && data.cursor.y < yPos && data.cursor.y < 60) {
      //       drawHeader();
      //   }
      // }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  } else {
    if (yPos > doc.internal.pageSize.getHeight() - 30) doc.addPage();
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_LIGHT_COLOR_RGB);
    doc.text("No detailed posture log entries for this day.", 14, yPos);
    yPos += 12; // Increased spacing
  }

  // --- General Posture Tips ---
  if (yPos > doc.internal.pageSize.getHeight() - 70) { // Initial check before section title
    doc.addPage();
    drawHeader();
  }
  drawSectionTitle("ML-Driven Posture Guidance"); // Sets font to bold, primary, size 15 and updates yPos

  // Set font for the tips content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_COLOR_RGB);

  const mlDrivenTips = [];
  mlDrivenTips.push(
    "- Your ESP32's ML model actively learns your posture patterns. Use its feedback to make conscious adjustments throughout the day."
  );

  if (typeof goodPosturePercentage === "number" && goodPosturePercentage > 75) {
    mlDrivenTips.push(
      `- Great job! The ML analysis indicates predominantly good posture (${goodPosturePercentage.toFixed(
        0
      )}%). Reinforce this by maintaining ergonomic awareness.`
    );
  } else if (typeof badPosturePercentage === "number" && badPosturePercentage > 40) {
    mlDrivenTips.push(
      `- The ML model detected frequent poor posture (${badPosturePercentage.toFixed(
        0
      )}%). Focus on exercises that counteract your common non-ideal positions.`
    );
  } else {
    mlDrivenTips.push(
      "- Pay attention to the ML model's classifications. If 'Warning' or 'Bad' postures are frequent, identify triggers like prolonged sitting or screen use."
    );
  }

  if (mostFrequentPrediction && mostFrequentPrediction !== "N/A" && mostFrequentPrediction !== "Good") {
     mlDrivenTips.push(
       `- The ML model most frequently classified your posture as '${mostFrequentPrediction}'. Consider specific stretches or ergonomic adjustments to address this pattern.`
     );
  }
   mlDrivenTips.push(
    "- Regularly review your detailed posture log and ML insights to understand how different activities impact your alignment."
  );

  const tipMaxWidth = doc.internal.pageSize.getWidth() - 28;
  // Use a tighter line height: fontSize * 1.05 (default is ~1.15)
  // Ensure getFontSize() is called after setFontSize(10)
  const lineHeight = doc.getFontSize() * 1.00;


  mlDrivenTips.forEach((tip) => {
    const splitLines = doc.splitTextToSize(tip, tipMaxWidth);

    splitLines.forEach((line) => {
      if (yPos + lineHeight > doc.internal.pageSize.getHeight() - 25) {
        doc.addPage();
        drawHeader();
        drawSectionTitle("ML-Driven Posture Guidance");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_COLOR_RGB);
      }
      doc.text(line, 14, yPos);
      yPos += lineHeight; // Increment yPos by the tighter line height
    });
  });

  yPos += 0; // Reduced spacing after the entire block of tips (was 12)

  // --- Notes & Glossary ---
  if (yPos > doc.internal.pageSize.getHeight() - 60) { // Adjusted space check
    doc.addPage();
    drawHeader();
  }
  drawSectionTitle("Notes & Glossary");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_COLOR_RGB);
  const notes = [
    "• Pitch Angle: Refers to your forward or backward lean. Lower angles generally indicate more upright posture.",
    "• ML Classification: Posture assessment by the app's machine learning model based on sensor data.",
    "• Avg. Pitch: The average pitch angle recorded during a specific period (e.g., an hour).",
    // Add more if needed, e.g., if calibrationStatus is passed:
    // reportData.calibrationStatus ? `• Calibration: ${reportData.calibrationStatus}` : "",
  ].filter((note) => note); // Filter out empty strings

  const noteMaxWidth = doc.internal.pageSize.getWidth() - 28;
  // Use a tighter line height: fontSize * 1.05
  // Ensure getFontSize() is called after setFontSize(10)
  const noteLineHeightActual = doc.getFontSize() * 1.05;


  notes.forEach((note) => {
    const splitLines = doc.splitTextToSize(note, noteMaxWidth);

    splitLines.forEach((line) => {
      if (yPos + noteLineHeightActual > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        drawHeader();
        drawSectionTitle("Notes & Glossary");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...TEXT_COLOR_RGB);
      }
      doc.text(line, 14, yPos);
      yPos += noteLineHeightActual; // Increment yPos by the tighter line height
    });
  });
  yPos += 0; // Reduced spacing after the notes section (was 10)

  // --- Footer ---
  const pageCount = doc.internal.getNumberOfPages();
  const footerY = doc.internal.pageSize.getHeight() - 10;
  const contactText = "Contact us: https://alignmate.vercel.app/contact";
  const contactTextWidth = doc.getTextWidth(contactText);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_LIGHT_COLOR_RGB);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      footerY,
      { align: "center" }
    );
    doc.text("Generated by AlignMate", 14, footerY);

    // Add contact link to the right
    doc.text(
      contactText,
      doc.internal.pageSize.getWidth() - 14 - contactTextWidth,
      footerY
    );

    if (i === pageCount && yPos < footerY - 5) {
      doc.setDrawColor(...BORDER_COLOR_RGB);
      doc.setLineWidth(0.1);
      doc.line(
        14,
        footerY - 5,
        doc.internal.pageSize.getWidth() - 14,
        footerY - 5
      );
    }
  }

  const fileNameDate = reportDate
    ? formatDateForPDF(reportDate).replace(/\s+/g, "_").replace(/,/g, "")
    : "UnknownDate";
  doc.save(`AlignMate_Report_${userName || "User"}_${fileNameDate}.pdf`);
  console.log("[DataExport] PDF generation complete.");
};
