import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    n || 0
  );
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const PAYMENT_LABELS = {
  cash: 'Cash',
  card: 'Card',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  other: 'Other',
};

// Sanitizes a string for use as a filename (no path separators, quotes, etc).
const slug = (s) =>
  (s || 'purchase')
    .toString()
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

// Builds a clean, printable invoice PDF for one purchase and triggers a
// browser download -- runs entirely client-side, no server round trip.
export const downloadPurchaseInvoice = (purchase) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 40);
  doc.text('Dundu Planning', margin, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  doc.text('Purchase Invoice', margin, 72);

  doc.setFontSize(9);
  doc.text(`Invoice #${purchase._id.slice(-8).toUpperCase()}`, pageWidth - margin, 56, { align: 'right' });
  doc.text(`Date: ${formatDate(purchase.purchaseDate || purchase.createdAt)}`, pageWidth - margin, 70, {
    align: 'right',
  });

  doc.setDrawColor(225, 225, 230);
  doc.line(margin, 88, pageWidth - margin, 88);

  // Vendor / purchase details
  let y = 114;
  const col2 = pageWidth / 2 + 10;

  const field = (x, yy, label, value) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 160);
    doc.text(label.toUpperCase(), x, yy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 40);
    doc.text(value || '—', x, yy + 15);
  };

  field(margin, y, 'Vendor', purchase.vendorName);
  field(col2, y, 'Location', purchase.location);
  y += 40;
  field(margin, y, 'Who', purchase.purchasedBy);
  field(col2, y, 'Payment Method', PAYMENT_LABELS[purchase.paymentMethod] || purchase.paymentMethod);
  y += 34;

  doc.setDrawColor(225, 225, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Line items
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Product', 'Qty', 'Amount']],
    body: (purchase.items || []).map((item) => [
      item.productName,
      String(item.quantity ?? ''),
      formatCurrency(item.totalAmount),
    ]),
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: { top: 6, bottom: 6, left: 0, right: 0 } },
    headStyles: {
      textColor: [150, 150, 160],
      fontStyle: 'normal',
      fontSize: 8.5,
      lineWidth: { bottom: 1 },
      lineColor: [225, 225, 230],
    },
    columnStyles: {
      1: { halign: 'right', cellWidth: 60 },
      2: { halign: 'right', cellWidth: 90 },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.5 };
        data.cell.styles.lineColor = [240, 240, 244];
      }
    },
  });

  const afterTableY = doc.lastAutoTable.finalY + 16;

  // Total
  doc.setDrawColor(30, 30, 40);
  doc.setLineWidth(1);
  doc.line(pageWidth - margin - 170, afterTableY, pageWidth - margin, afterTableY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  doc.text('TOTAL', pageWidth - margin - 170, afterTableY + 18);
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 40);
  doc.text(formatCurrency(purchase.totalCost), pageWidth - margin, afterTableY + 19, { align: 'right' });

  let noteY = afterTableY + 46;
  if (purchase.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(150, 150, 160);
    doc.text('NOTES', margin, noteY);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 70);
    const lines = doc.splitTextToSize(purchase.notes, pageWidth - margin * 2);
    doc.text(lines, margin, noteY + 14);
    noteY += 14 + lines.length * 13;
  }

  doc.setFontSize(8);
  doc.setTextColor(180, 180, 190);
  doc.text(
    `Generated ${new Date().toLocaleString('en-IN')}`,
    margin,
    doc.internal.pageSize.getHeight() - 30
  );

  doc.save(`invoice-${slug(purchase.vendorName)}-${formatDate(purchase.purchaseDate || purchase.createdAt).replace(/\s/g, '-')}.pdf`);
};
