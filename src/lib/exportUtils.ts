import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Common styled export utility for Excel
 * @param filename Name of the downloaded file
 * @param headers Array of header names (e.g. ['Date', 'Type', 'Amount'])
 * @param data Array of arrays containing the data rows
 */
export const exportToStyledExcel = async (
  filename: string, 
  headers: string[], 
  data: any[][]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Insert "Sr No." at the beginning
  const finalHeaders = ['Sr No.', ...headers];
  const finalData = data.map((row, index) => [index + 1, ...row]);

  // Set Headers
  worksheet.addRow(finalHeaders);

  // Style Headers
  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0D9488' }, // Brand Primary Color (Teal)
    };
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' }, // White text
      size: 11
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Add Data
  finalData.forEach(row => {
    const dataRow = worksheet.addRow(row);
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center all data by default, similar to screenshot
    });
  });

  // Auto-fit Columns (simple approach)
  worksheet.columns.forEach((col, i) => {
    let maxLength = 0;
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    col.width = maxLength < 10 ? 10 : maxLength + 2;
  });

  // Generate File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
};

/**
 * Common styled export utility for PDF
 * @param title Document title to display at the top
 * @param filename Name of the downloaded file
 * @param headers Array of header names
 * @param data Array of arrays containing the data rows
 */
export const exportToStyledPDF = (
  title: string,
  filename: string,
  headers: string[],
  data: any[][]
) => {
  const doc = new jsPDF('landscape'); // Landscape is usually better for wide reports
  
  // Insert "Sr No." at the beginning
  const finalHeaders = [['Sr No.', ...headers]];
  const finalData = data.map((row, index) => [index + 1, ...row]);

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136); // Brand Primary Color (Teal)
  doc.text(title, 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'dd-MM-yyyy hh:mm a')}`, 14, 22);

  autoTable(doc, {
    head: finalHeaders,
    body: finalData,
    startY: 28,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
      halign: 'center',
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [13, 148, 136], // Brand Primary Theme Color
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });

  doc.save(`${filename}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};
