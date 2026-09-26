import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('id');

  if (!paymentId) return new NextResponse('Payment ID required', { status: 400 });

  const invoice = await db.invoice.findFirst({
    where: { paymentId },
    include: {
      booking: {
        include: {
          customer: { include: { user: true } },
          worker: { include: { user: true } },
          subcategory: true
        }
      }
    }
  });

  if (!invoice) return new NextResponse('Invoice not found', { status: 404 });

  const html = `
    <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #6d28d9; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; color: #6d28d9; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f8fafc; }
          .total { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Mistrify Technologies</div>
          <p>Official Tax Invoice</p>
        </div>
        
        <div class="row">
          <div>
            <strong>Billed To:</strong><br>
            ${invoice.booking.customer.user.name}<br>
            ${invoice.booking.customer.user.mobile}
          </div>
          <div style="text-align: right;">
            <strong>Invoice ID:</strong> #${invoice.id.slice(-8).toUpperCase()}<br>
            <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
            <strong>Status:</strong> PAID
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Service Description</th>
              <th>Professional</th>
              <th>Base Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.booking.subcategory.name} Service</td>
              <td>${invoice.booking.worker.user.name}</td>
              <td>₹${(invoice as any).amount}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right;">GST (18%)</td>
              <td>₹${(invoice as any).taxAmount}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right;" class="total">Total Paid</td>
              <td class="total">₹${(invoice as any).totalAmount}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin-top: 50px; text-align: center; color: #666;">
          Thank you for trusting Mistrify!<br>
          This is a computer generated invoice and requires no physical signature.
        </p>
        
        <script>
          window.onload = () => window.print();
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
