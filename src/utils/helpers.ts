import { Student } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const createWhatsAppUrl = (phone: string, text: string): string => {
  // Clean phone number
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('09')) {
    cleaned = '963' + cleaned.substring(1);
  } else if (cleaned.startsWith('05')) {
    cleaned = '966' + cleaned.substring(1);
  }
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
};

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  // UTF-8 BOM for Excel Arabic support
  const csvContent =
    '\uFEFF' +
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const calculateStudentBalance = (student: Partial<Student>) => {
  const books = Number(student.booksFee || 0);
  const uniform = Number(student.uniformFee || 0);
  const tuition = Number(student.tuitionFee || 0);
  const total = books + uniform + tuition;
  const first = Number(student.firstPayment || 0);
  const second = Number(student.secondPayment || 0);
  const remaining = total - (first + second);
  return {
    total,
    paid: first + second,
    remaining: Math.max(0, remaining),
  };
};
