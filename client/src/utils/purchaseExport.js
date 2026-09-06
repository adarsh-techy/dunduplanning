const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '');

const PAYMENT_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  other: 'Other',
};

// Wraps a value in quotes and escapes any inner quotes, per CSV rules --
// needed since vendor names/notes can contain commas or quotes of their own.
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

// A plain CSV opens directly in Excel (and Sheets, Numbers, etc.) with no
// extra library needed -- unlike a real .xlsx, which would mean pulling in
// a parsing/writing library just to produce output we never need to read
// back. One row per purchase; each product line is folded into the same
// row rather than split across rows, so counts stay meaningful in Excel.
export const downloadPurchasesCsv = (purchases, filename = 'purchases') => {
  const header = ['Vendor', 'Location', 'Date', 'Who', 'Payment Method', 'Products', 'Item Count', 'Total (INR)'];
  const rows = purchases.map((p) => [
    p.vendorName || '',
    p.location || '',
    formatDate(p.purchaseDate),
    p.purchasedBy || '',
    PAYMENT_LABELS[p.paymentMethod] || p.paymentMethod || '',
    (p.items || []).map((i) => `${i.productName} (x${i.quantity})`).join('; '),
    p.items?.length || 0,
    p.totalCost || 0,
  ]);

  // A leading UTF-8 BOM makes Excel on Windows detect the encoding
  // correctly instead of mangling any non-ASCII characters.
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
