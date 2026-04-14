import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autotable types for TypeScript
interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateInvoicePDF = (data: {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: any[];
  subtotal: number;
  gstRate: number;
  tax: number;
  total: number;
}) => {
  const doc = new jsPDF() as jsPDFWithPlugin;
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header & Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(190, 155, 110); // AAR Gold
  doc.text("AAR SALON & ACADEMY", 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Luxury Beauty & Professional Training Hub", 20, 32);
  doc.text("Sector 18, Noida, Uttar Pradesh 201301", 20, 37);
  doc.text("Phone: +91 91234 56789 | Email: contact@aarsalon.com", 20, 42);

  // 2. Invoice Metadata (Right Aligned)
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, 25, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${data.invoiceNo}`, pageWidth - 20, 32, { align: "right" });
  doc.text(`Date: ${data.date}`, pageWidth - 20, 37, { align: "right" });
  doc.text(`Status: PAID`, pageWidth - 20, 42, { align: "right" });

  doc.setDrawColor(190, 155, 110);
  doc.setLineWidth(0.5);
  doc.line(20, 50, pageWidth - 20, 50);

  // 3. Bill To
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 20, 62);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName || "Walk-in Guest", 20, 68);
  if (data.customerPhone) {
    doc.text(`Phone: ${data.customerPhone}`, 20, 73);
  }

  // 4. Items Table
  const tableColumn = ["#", "Service / Product Item", "Qty", "Unit Price", "Total"];
  const tableRows = data.items.map((item, index) => [
    index + 1,
    item.title,
    item.quantity,
    `INR ${item.price.toLocaleString()}`,
    `INR ${(item.price * item.quantity).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { 
      fillColor: [190, 155, 110], 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    }
  });

  // 5. Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", pageWidth - 70, finalY);
  doc.text(`INR ${data.subtotal.toLocaleString()}`, pageWidth - 20, finalY, { align: "right" });

  doc.text(`GST (${data.gstRate}%):`, pageWidth - 70, finalY + 6);
  doc.text(`INR ${data.tax.toLocaleString()}`, pageWidth - 20, finalY + 6, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 70, finalY + 9, pageWidth - 20, finalY + 9);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(190, 155, 110);
  doc.text("Total Payable:", pageWidth - 70, finalY + 16);
  doc.text(`INR ${data.total.toLocaleString()}`, pageWidth - 20, finalY + 16, { align: "right" });

  // 6. Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for choosing AAR Salon & Academy! Your trust is our beauty.", pageWidth / 2, pageWidth === 210 ? 285 : 275, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated invoice and doesn't require a physical signature.", pageWidth / 2, (pageWidth === 210 ? 285 : 275) + 5, { align: "center" });

  // Download PDF
  doc.save(`${data.invoiceNo}_AAR_Salon.pdf`);
};
