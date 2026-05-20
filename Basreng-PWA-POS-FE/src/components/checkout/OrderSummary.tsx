import React from "react";
import { rupiahFormat } from "../../hooks/formatting";

interface Props {
  total: number;
  discount: number;
}

const OrderSummary: React.FC<Props> = ({ total, discount }) => {
  const grandTotal = Math.max(0, total - discount);

  return (
    <div className="order-summary-container">
      <div className="summary-row">
        <span className="summary-label">Total Belanja:</span>
        <span className="summary-value">{rupiahFormat(total)}</span>
      </div>

      {discount > 0 && (
        <div className="summary-row discount-row">
          <span className="summary-label">Diskon Reseller:</span>
          <span className="summary-value">-{rupiahFormat(discount)}</span>
        </div>
      )}

      <div className="summary-row grand-total-row">
        <span className="summary-label">Total Bayar:</span>
        <span className="summary-value">{rupiahFormat(grandTotal)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;
