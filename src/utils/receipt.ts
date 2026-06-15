import { toast } from 'sonner';

export interface ReceiptData {
  reservation: {
    id: number;
    guestId: string;
    guestName: string;
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    pricePerNight: number;
  };
  roomServiceOrders: Array<{
    id: number;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  invoice: {
    id: number;
    amount: number;
    status: string;
    issueDate: string;
  } | null;
}

export async function downloadReceipt(reservationId: number | string, apiUrl: string) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch receipt data' }));
      throw new Error(errorData.error || 'Failed to fetch receipt data');
    }

    const data: ReceiptData = await response.json();
    openReceiptWindow(data);
  } catch (err: any) {
    toast.error(err.message || 'Failed to download receipt');
  }
}

function openReceiptWindow(data: ReceiptData) {
  const { reservation, roomServiceOrders, invoice } = data;

  const nights = Math.ceil(
    (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) /
      (1000 * 3600 * 24)
  );

  const roomTotal = nights * reservation.pricePerNight;
  const roomServiceTotal = roomServiceOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const grandTotal = roomTotal + roomServiceTotal;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatCurrency = (n: number) => `UGX ${Number(n || 0).toLocaleString()}`;

  const roomServiceRows = roomServiceOrders.length
    ? roomServiceOrders
        .map(
          (order) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-weight:600;color:#002B45;">Room Service Order #${order.id}</div>
            <div style="font-size:12px;color:#6b7280;">
              ${order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </div>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#002B45;">
            ${formatCurrency(order.totalAmount)}
          </td>
        </tr>
      `
        )
        .join('')
    : `<tr><td colspan="2" style="padding:8px 0;color:#9ca3af;font-size:13px;">No room service orders</td></tr>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt - Reservation #${reservation.id}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f4f6;
      margin: 0;
      padding: 40px 20px;
      color: #1f2937;
    }
    .receipt-container {
      max-width: 700px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      padding: 48px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #C5A059;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .hotel-name {
      font-size: 28px;
      font-weight: 700;
      color: #002B45;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .hotel-sub {
      font-size: 12px;
      color: #6b7280;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .receipt-title {
      font-size: 20px;
      font-weight: 700;
      color: #002B45;
      margin-top: 24px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #C5A059;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 6px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 10px;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #002B45;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .total-row {
      border-top: 2px solid #002B45;
    }
    .total-row td {
      padding-top: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #002B45;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 0;
    }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-pending { background: #ffedd5; color: #9a3412; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #002B45;
      color: #fff;
      border: none;
      padding: 12px 24px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
    }
    .print-btn:hover { background: #C5A059; color: #002B45; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">Print / Save as PDF</button>

  <div class="receipt-container">
    <div class="header">
      <div class="hotel-name">Margarita Tropical</div>
      <div class="hotel-sub">Hotel & Resort</div>
      <div class="receipt-title">Guest Receipt</div>
    </div>

    <div class="section">
      <div class="section-title">Reservation Details</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Receipt Number</span>
          <span class="info-value">#HMS-${reservation.id.toString().padStart(5, '0')}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date Issued</span>
          <span class="info-value">${formatDate(new Date().toISOString())}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Guest Name</span>
          <span class="info-value">${reservation.guestName || 'Guest'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Payment Status</span>
          <span class="info-value">
            <span class="status-badge status-${reservation.paymentStatus}">${reservation.paymentStatus}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Stay Information</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Room Number</span>
          <span class="info-value">${reservation.roomNumber}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Room Type</span>
          <span class="info-value">${reservation.roomType || 'Standard'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Check In</span>
          <span class="info-value">${formatDate(reservation.checkInDate)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Check Out</span>
          <span class="info-value">${formatDate(reservation.checkOutDate)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Duration</span>
          <span class="info-value">${nights} Night${nights !== 1 ? 's' : ''}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Reservation Status</span>
          <span class="info-value" style="text-transform:capitalize;">${reservation.status}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Charges</div>
      <table>
        <tbody>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
              <div style="font-weight:600;color:#002B45;">Room Charge</div>
              <div style="font-size:12px;color:#6b7280;">${formatCurrency(reservation.pricePerNight)} × ${nights} night${nights !== 1 ? 's' : ''}</div>
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#002B45;">
              ${formatCurrency(roomTotal)}
            </td>
          </tr>
          ${roomServiceRows}
          <tr class="total-row">
            <td style="padding-top:12px;">Total Amount</td>
            <td style="padding-top:12px;text-align:right;">${formatCurrency(grandTotal)}</td>
          </tr>
          ${invoice ? `
          <tr>
            <td style="padding-top:8px;font-size:12px;color:#6b7280;">Invoice #${invoice.id} — ${invoice.status}</td>
            <td style="padding-top:8px;text-align:right;font-size:12px;color:#6b7280;">Issued ${formatDate(invoice.issueDate)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p style="margin-bottom:4px;"><strong>Margarita Tropical Hotel & Resort</strong></p>
      <p>+256 700 123 456 &nbsp;|&nbsp; reservations@margarita.tropical</p>
      <p style="margin-top:8px;font-size:11px;">Thank you for choosing Margarita Tropical. We hope you enjoyed your stay!</p>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error('Popup blocked. Please allow popups to download receipts.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();

  // Auto-trigger print after a short delay to ensure styles are loaded
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 300);
}

