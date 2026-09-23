import { Student } from '../types';

export type ExportFieldCategory = 'comprehensive' | 'financial' | 'contacts' | 'academic';
export type ExportFormat = 'excel' | 'csv' | 'json';

export interface ExportOptions {
  category: ExportFieldCategory;
  format: ExportFormat;
  filename?: string;
  schoolName?: string;
  academicYear?: string;
}

/**
 * Format a number as integer or formatted string
 */
const safeNum = (val: any): number => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

/**
 * Clean text for CSV (escape double quotes)
 */
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = String(val);
  str = str.replace(/"/g, '""');
  if (str.search(/("|,|\n|\r)/g) >= 0) {
    str = `"${str}"`;
  }
  return str;
};

/**
 * Convert students to raw key-value records based on selected template
 */
export const prepareStudentExportRecords = (
  students: Student[],
  category: ExportFieldCategory = 'comprehensive'
): Record<string, any>[] => {
  return students.map((s, index) => {
    const totalAmount = safeNum(s.totalAmount);
    const firstPayment = safeNum(s.firstPayment);
    const secondPayment = safeNum(s.secondPayment);
    const paidTotal = firstPayment + secondPayment;
    const remaining = Math.max(0, safeNum(s.remainingAmount ?? (totalAmount - paidTotal)));
    const paymentStatus = remaining === 0 ? 'مسدد بالكامل' : paidTotal > 0 ? 'مسدد جزئياً' : 'غير مسدد';
    const fullName = `${s.firstName || ''} ${s.fatherName || ''} ${s.grandFatherName || ''} ${s.lastName || ''}`.trim();

    if (category === 'financial') {
      return {
        'ت': index + 1,
        'رقم الطالب': s.id || '',
        'اسم الطالب الرباعي': fullName,
        'الصف الدراسي': s.currentGrade || '',
        'الشعبة': s.section || '',
        'ولي الأمر': s.guardianName || '',
        'هاتف التواصل': s.guardianPhone || '',
        'رسوم الكتب ($)': safeNum(s.booksFee),
        'رسوم اللباس ($)': safeNum(s.uniformFee),
        'القسط المدرسي ($)': safeNum(s.tuitionFee),
        'إجمالي الرسوم ($)': totalAmount,
        'الدفعة الأولى ($)': firstPayment,
        'تاريخ الدفعة الأولى': s.firstPaymentDate || '—',
        'الدفعة الثانية ($)': secondPayment,
        'تاريخ الدفعة الثانية': s.secondPaymentDate || '—',
        'إجمالي المدفوع ($)': paidTotal,
        'المبلغ المتبقي ($)': remaining,
        'حالة السداد': paymentStatus,
        'تاريخ استحقاق المتبقي': s.secondPaymentDueDate || '—',
      };
    }

    if (category === 'contacts') {
      return {
        'ت': index + 1,
        'رقم الطالب': s.id || '',
        'اسم الطالب': fullName,
        'الصف': s.currentGrade || '',
        'الشعبة': s.section || '',
        'الفوج': s.regiment || '',
        'اسم ولي الأمر': s.guardianName || '',
        'صفة ولي الأمر': s.guardianRelation || 'أب',
        'مهنة ولي الأمر': s.guardianJob || '—',
        'هاتف ولي الأمر (واتساب)': s.guardianPhone || '',
        'جهة اتصال الطوارئ': s.emergencyName || '—',
        'صلة قرابة الطوارئ': s.emergencyRelation || '—',
        'هاتف الطوارئ': s.emergencyPhone || '—',
        'مكان الإقامة': s.residencePlace || '—',
        'العنوان التفصيلي': s.detailedAddress || '—',
      };
    }

    if (category === 'academic') {
      return {
        'ت': index + 1,
        'رقم الطالب': s.id || '',
        'الرقم الوطني / الهوية': s.idcard || '',
        'اسم الطالب الرباعي': fullName,
        'الجنس': s.gender || '',
        'الصف الحالي': s.currentGrade || '',
        'الشعبة': s.section || '',
        'الفوج': s.regiment || '',
        'تاريخ الميلاد': s.birthDate || '',
        'مكان الميلاد': s.birthPlace || '',
        'الصف السابق': s.previousGrade || '',
        'المدرسة السابقة': s.previousSchool || '',
        'المعدل السابق': s.gpa || '—',
        'الحالة الصحية': s.healthStatus || 'سليم معافى',
        'المواهب والاهتمامات': s.talent || '—',
        'استلام الكتب': s.receivedBooks ? 'نعم (تم التسليم)' : 'لا (غير مستلم)',
        'استلام اللباس': s.receivedUniform ? 'نعم (تم التسليم)' : 'لا (غير مستلم)',
        'اشتراك الباص / النقل': s.hasBus ? 'نعم (مشترك)' : 'لا',
        'الملاحظات التربوية': s.notes || '—',
      };
    }

    // Default: comprehensive / full master backup
    return {
      'ت': index + 1,
      'رقم الطالب (الكود)': s.id || '',
      'الرقم الوطني / الهوية': s.idcard || '',
      'الاسم الأول': s.firstName || '',
      'اسم الأب': s.fatherName || '',
      'اسم الجد': s.grandFatherName || '',
      'الكنية / النسبة': s.lastName || '',
      'الاسم الرباعي الكامل': fullName,
      'اسم الأم': s.motherName || '',
      'الجنس': s.gender || '',
      'تاريخ الميلاد': s.birthDate || '',
      'مكان الميلاد': s.birthPlace || '',
      'مكان الإقامة': s.residencePlace || '',
      'العنوان التفصيلي': s.detailedAddress || '',
      'الصف الدراسي الحالي': s.currentGrade || '',
      'الشعبة': s.section || '',
      'الفوج': s.regiment || '',
      'الصف السابق': s.previousGrade || '',
      'المدرسة السابقة': s.previousSchool || '',
      'المعدل السابق': s.gpa || '',
      'الحالة الصحية': s.healthStatus || '',
      'الموهبة والاهتمامات': s.talent || '',
      'اسم ولي الأمر': s.guardianName || '',
      'صفة ولي الأمر': s.guardianRelation || '',
      'مهنة ولي الأمر': s.guardianJob || '',
      'هاتف ولي الأمر': s.guardianPhone || '',
      'جهة اتصال الطوارئ': s.emergencyName || '',
      'صلة قرابة الطوارئ': s.emergencyRelation || '',
      'هاتف الطوارئ': s.emergencyPhone || '',
      'استلام الكتب': s.receivedBooks ? 'نعم' : 'لا',
      'استلام الزي المدرسي': s.receivedUniform ? 'نعم' : 'لا',
      'اشتراك النقل المدرسي': s.hasBus ? 'نعم' : 'لا',
      'رسوم الكتب ($)': safeNum(s.booksFee),
      'رسوم اللباس ($)': safeNum(s.uniformFee),
      'القسط الدراسي ($)': safeNum(s.tuitionFee),
      'إجمالي الرسوم ($)': totalAmount,
      'الدفعة الأولى ($)': firstPayment,
      'تاريخ الدفعة الأولى': s.firstPaymentDate || '',
      'الدفعة الثانية ($)': secondPayment,
      'تاريخ الدفعة الثانية': s.secondPaymentDate || '',
      'تاريخ استحقاق الدفعة الثانية': s.secondPaymentDueDate || '',
      'إجمالي المدفوع ($)': paidTotal,
      'المبلغ المتبقي ($)': remaining,
      'حالة السداد': paymentStatus,
      'الملاحظات': s.notes || '',
    };
  });
};

/**
 * Trigger browser file download
 */
const downloadFile = (content: BlobPart, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export to CSV with UTF-8 BOM
 */
export const exportStudentsToCSV = (
  students: Student[],
  category: ExportFieldCategory = 'comprehensive',
  customFilename?: string
): { success: boolean; filename: string; count: number } => {
  if (!students || students.length === 0) {
    return { success: false, filename: '', count: 0 };
  }

  const rows = prepareStudentExportRecords(students, category);
  const headers = Object.keys(rows[0]);
  const separator = ',';

  // UTF-8 BOM ensures Excel displays Arabic perfectly
  const csvContent =
    '\uFEFF' +
    headers.map(escapeCSV).join(separator) +
    '\r\n' +
    rows
      .map(row => headers.map(k => escapeCSV(row[k])).join(separator))
      .join('\r\n');

  const dateStr = new Date().toISOString().split('T')[0];
  const catNames: Record<ExportFieldCategory, string> = {
    comprehensive: 'سجل_شامل_للطلاب',
    financial: 'كشف_مالي_للطلاب',
    contacts: 'كشف_عناوين_واتصالات_الطلاب',
    academic: 'سجل_أكاديمي_ولوازم_الطلاب',
  };

  const filename = customFilename || `${catNames[category]}_${dateStr}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

  return { success: true, filename, count: students.length };
};

/**
 * Export to Excel (.xls) with RTL table and styled headers
 */
export const exportStudentsToExcel = (
  students: Student[],
  category: ExportFieldCategory = 'comprehensive',
  schoolName = 'المدرسة الدولية الخاصة',
  academicYear = '2024 - 2025',
  customFilename?: string
): { success: boolean; filename: string; count: number } => {
  if (!students || students.length === 0) {
    return { success: false, filename: '', count: 0 };
  }

  const rows = prepareStudentExportRecords(students, category);
  const headers = Object.keys(rows[0]);

  const catTitles: Record<ExportFieldCategory, string> = {
    comprehensive: 'السجل العام الشامل لبيانات الطلاب (نسخة احتياطية رسمية)',
    financial: 'كشف الرسوم الدراسية والمستحقات المالية للطلاب',
    contacts: 'دليل بيانات التواصل وأولياء أمور الطلاب',
    academic: 'سجل القيد الأكاديمي واللوازم المدرسية',
  };

  const tableHeaderHtml = headers
    .map(
      h =>
        `<th style="background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #0f172a; padding: 10px 8px; font-size: 13px; text-align: center;">${h}</th>`
    )
    .join('');

  const tableBodyHtml = rows
    .map((row, idx) => {
      const isEven = idx % 2 === 0;
      const bg = isEven ? '#ffffff' : '#f8fafc';
      const cells = headers
        .map(h => {
          const val = row[h];
          const isNum = typeof val === 'number';
          const isPaidStatus = h === 'حالة السداد';
          let textColor = '#1e293b';
          let fontWeight = 'normal';

          if (isPaidStatus) {
            if (val === 'مسدد بالكامل') textColor = '#059669';
            else if (val === 'غير مسدد') textColor = '#dc2626';
            else textColor = '#d97706';
            fontWeight = 'bold';
          }

          return `<td style="border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; text-align: ${
            isNum || isPaidStatus ? 'center' : 'right'
          }; color: ${textColor}; font-weight: ${fontWeight};">${val !== undefined && val !== null ? val : ''}</td>`;
        })
        .join('');

      return `<tr style="background-color: ${bg};">${cells}</tr>`;
    })
    .join('');

  const excelHtml = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${catTitles[category].substring(0, 30)}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayRightToLeft/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; margin: 20px; }
    .school-title { font-size: 18px; font-weight: bold; color: #1e3a8a; text-align: center; margin-bottom: 4px; }
    .sub-title { font-size: 14px; font-weight: bold; color: #334155; text-align: center; margin-bottom: 4px; }
    .meta-info { font-size: 11px; color: #64748b; text-align: center; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; direction: rtl; }
  </style>
</head>
<body dir="rtl">
  <div class="school-title">${schoolName}</div>
  <div class="sub-title">${catTitles[category]}</div>
  <div class="meta-info">العام الدراسي: ${academicYear} • تاريخ التصدير: ${new Date().toLocaleDateString('ar-SY')} • إجمالي السجلات: ${students.length} طالب • برمجة وتطوير: م. محمود العبدالله</div>
  <table border="1" cellpadding="5" cellspacing="0">
    <thead>
      <tr>${tableHeaderHtml}</tr>
    </thead>
    <tbody>
      ${tableBodyHtml}
    </tbody>
  </table>
</body>
</html>
  `.trim();

  const dateStr = new Date().toISOString().split('T')[0];
  const catNames: Record<ExportFieldCategory, string> = {
    comprehensive: 'كشف_شامل_للطلاب',
    financial: 'كشف_مالي_للطلاب',
    contacts: 'دليل_تواصل_الطلاب',
    academic: 'سجل_أكاديمي_للطلاب',
  };

  const filename = customFilename || `${catNames[category]}_${dateStr}.xls`;
  downloadFile(excelHtml, filename, 'application/vnd.ms-excel;charset=utf-8;');

  return { success: true, filename, count: students.length };
};

/**
 * Export raw JSON data for disaster recovery or database restore
 */
export const exportStudentsToJSON = (
  students: Student[],
  customFilename?: string
): { success: boolean; filename: string; count: number } => {
  if (!students || students.length === 0) {
    return { success: false, filename: '', count: 0 };
  }

  const exportPayload = {
    exportDate: new Date().toISOString(),
    system: 'School Management System',
    developer: 'Eng. Mahmoud Al-Abdullah (+963 939 841 552)',
    totalStudents: students.length,
    students,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `نسخة_احتياطية_كاملة_للطلاب_${dateStr}.json`;

  downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
  return { success: true, filename, count: students.length };
};
