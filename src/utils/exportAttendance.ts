import { jsPDF } from 'jspdf';
import { AttendanceRecord } from '../types';

/**
 * Helper to export attendance records as Excel CSV (.csv / .xlsx compatible)
 * Includes UTF-8 BOM so Excel opens non-ASCII characters and columns correctly.
 */
export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  filename = 'Student_Attendance_Register.csv'
) {
  if (!records || records.length === 0) {
    alert('No attendance records available to export.');
    return;
  }

  const headers = [
    'Date',
    'Student ID',
    'Roll Number',
    'Student Name',
    'Course',
    'Batch',
    'Subject',
    'Class Period',
    'Attendance Status',
    'Faculty Name',
    'Remarks'
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCsv(r.attendanceDate),
    escapeCsv(r.studentId),
    escapeCsv(r.rollNumber),
    escapeCsv(r.studentName),
    escapeCsv(r.courseName || r.courseId),
    escapeCsv(r.batchName || r.batchId),
    escapeCsv(r.subjectName || r.subjectId),
    escapeCsv(r.classPeriod),
    escapeCsv(r.attendanceStatus),
    escapeCsv(r.facultyName),
    escapeCsv(r.remarks || '')
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to export attendance register to PDF
 */
export function exportAttendanceToPdf(
  records: AttendanceRecord[],
  title = 'Student Attendance Register',
  subtitle = 'Pearl Computer & Target Academy'
) {
  if (!records || records.length === 0) {
    alert('No attendance records available for PDF generation.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Title & Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(subtitle.toUpperCase(), 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${title} | Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 18);

  // Stats Summary
  const total = records.length;
  const present = records.filter(r => r.attendanceStatus === 'Present').length;
  const absent = records.filter(r => r.attendanceStatus === 'Absent').length;
  const late = records.filter(r => r.attendanceStatus === 'Late').length;
  const leave = records.filter(r => r.attendanceStatus === 'Leave' || r.attendanceStatus === 'Half Day').length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records: ${total}   |   Present: ${present} (${rate}%)   |   Absent: ${absent}   |   Late: ${late}   |   Leave/HalfDay: ${leave}`, 14, 30);

  // Table Headers
  let startY = 36;
  const startX = 14;
  const colWidths = [22, 28, 28, 45, 45, 30, 25, 25, 25];
  const headers = ['Date', 'Student ID', 'Roll No.', 'Student Name', 'Course / Batch', 'Subject', 'Period', 'Status', 'Faculty'];

  doc.setFillColor(241, 245, 249);
  doc.rect(startX, startY, 269, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  let currentX = startX + 2;
  headers.forEach((h, idx) => {
    doc.text(h, currentX, startY + 5.5);
    currentX += colWidths[idx];
  });

  startY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  records.slice(0, 35).forEach((r, rowIdx) => {
    if (startY > 185) return; // simple 1 page landscape fit for preview

    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(startX, startY, 269, 6, 'F');
    }

    // Status colors
    if (r.attendanceStatus === 'Present') doc.setTextColor(16, 185, 129);
    else if (r.attendanceStatus === 'Absent') doc.setTextColor(239, 68, 68);
    else if (r.attendanceStatus === 'Late') doc.setTextColor(217, 119, 6);
    else doc.setTextColor(99, 102, 241);

    let x = startX + 2;
    doc.setTextColor(15, 23, 42);
    doc.text(r.attendanceDate || '', x, startY + 4); x += colWidths[0];
    doc.text(r.studentId || '', x, startY + 4); x += colWidths[1];
    doc.text(r.rollNumber || '', x, startY + 4); x += colWidths[2];
    doc.text((r.studentName || '').substring(0, 22), x, startY + 4); x += colWidths[3];
    doc.text((r.courseName || r.courseId || '').substring(0, 22), x, startY + 4); x += colWidths[4];
    doc.text((r.subjectName || r.subjectId || '').substring(0, 16), x, startY + 4); x += colWidths[5];
    doc.text((r.classPeriod || '').substring(0, 14), x, startY + 4); x += colWidths[6];

    // Status badge text bold
    doc.setFont('helvetica', 'bold');
    if (r.attendanceStatus === 'Present') doc.setTextColor(16, 185, 129);
    else if (r.attendanceStatus === 'Absent') doc.setTextColor(239, 68, 68);
    else if (r.attendanceStatus === 'Late') doc.setTextColor(217, 119, 6);
    else doc.setTextColor(99, 102, 241);

    doc.text(r.attendanceStatus || '', x, startY + 4); x += colWidths[7];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text((r.facultyName || '').substring(0, 16), x, startY + 4);

    startY += 6;
  });

  // Footer Signature Block
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signature (Faculty)', 20, 195);
  doc.text('Verified By (Institute Administrator)', 200, 195);
  doc.line(20, 190, 80, 190);
  doc.line(200, 190, 260, 190);

  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

/**
 * Helper to trigger print dialog for Attendance Register
 */
export function printAttendanceRegister(
  records: AttendanceRecord[],
  title = 'Student Attendance Register'
) {
  if (!records || records.length === 0) {
    alert('No attendance records available to print.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    alert('Please allow popups to print the attendance register.');
    return;
  }

  const rowsHtml = records.map((r, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; font-size: 11px;">
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${i + 1}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${r.attendanceDate}</strong></td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.studentId}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.rollNumber}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${r.studentName}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.courseName || r.courseId}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.batchName || r.batchId}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.subjectName || r.subjectId}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.classPeriod}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: ${
        r.attendanceStatus === 'Present' ? '#059669' :
        r.attendanceStatus === 'Absent' ? '#dc2626' :
        r.attendanceStatus === 'Late' ? '#d97706' : '#4f46e5'
      };">${r.attendanceStatus}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.facultyName}</td>
      <td style="padding: 6px; border: 1px solid #cbd5e1;">${r.remarks || '-'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 20px; color: #1e293b; text-transform: uppercase; }
          .header p { margin: 3px 0; font-size: 12px; color: #64748b; }
          .stats-bar { background: #f1f5f9; padding: 10px; font-size: 12px; font-weight: bold; margin-bottom: 15px; border-radius: 4px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #1e293b; color: #ffffff; padding: 8px; font-size: 11px; text-align: left; border: 1px solid #0f172a; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; font-size: 12px; font-weight: bold; }
          .sig-box { width: 200px; border-top: 1px solid #0f172a; text-align: center; padding-top: 5px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PEARL COMPUTER & TARGET ACADEMY</h1>
          <p>ISO 9001:2015 Certified Educational Institute | Student Attendance Register</p>
          <p><strong>${title}</strong> - Printed on ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div class="stats-bar">
          <span>Total Student Records: ${records.length}</span>
          <span>P: ${records.filter(r => r.attendanceStatus === 'Present').length}</span>
          <span>A: ${records.filter(r => r.attendanceStatus === 'Absent').length}</span>
          <span>L: ${records.filter(r => r.attendanceStatus === 'Late').length}</span>
          <span>Leave/HD: ${records.filter(r => r.attendanceStatus === 'Leave' || r.attendanceStatus === 'Half Day').length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Student ID</th>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Subject</th>
              <th>Period</th>
              <th>Status</th>
              <th>Faculty</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">Faculty Member Signature</div>
          <div class="sig-box">HOD / Course Coordinator</div>
          <div class="sig-box">Center Director Seal</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
