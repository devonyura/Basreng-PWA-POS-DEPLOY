import React from "react";
import { rupiahFormat, formatProductName } from "../hooks/formatting";
import "./Receipt.css";
import { Reseller } from "../pages/kasir/TransactionHistoryDetail";
import { isPackageItem, parsePackageDescriptions } from "../utils/receiptItems";

interface ReceiptHistoryProps {
  username: string;
  branch_id: string;
  cash: number;
  change: number;
  total: number;
  isOnlineOrders: boolean;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  cartItems: {
    variant_id: string;
    name: string;
    price: number;
    subtotal: number;
    quantity: number;
    weight_grams?: number;
    descriptions: string;
    category_name?: string | null;
  }[];
  receiptNoteNumber: string | null;
  discount: number | string;
  is_reseller: boolean;
  isShopeeOrder: boolean;
  shopeeCode: string | null | undefined;
  paymentMethod: string | null | undefined;
  date?: string;
  branch_name: string;
  branch_address: string;
  reseller: Reseller | undefined;
}

const ReceiptHistory = React.forwardRef<HTMLDivElement, ReceiptHistoryProps>(
  (props, ref) => {
    const {
      username,
      cash,
      change,
      total,
      isOnlineOrders,
      customerInfo,
      cartItems,
      receiptNoteNumber,
      discount,
      is_reseller,
      isShopeeOrder,
      shopeeCode,
      paymentMethod,
      date,
      branch_name,
      branch_address,
      reseller,
    } = props;

    const formatDate = (dateString?: string) => {
      const d = dateString ? new Date(dateString) : new Date();
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
      <div className="receipt-container" ref={ref}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
          <img src="/logo-struk.png" style={{ width: "230px", height: "auto" }} alt="App Logo" />
        </div>
        <table className="receipt">
          <thead>
            <tr className="receipt-title">
              <th colSpan={4} style={{ textAlign: "center", fontWeight: "normal", textTransform: "none" }}>
                {branch_address || "Alamat Toko"}
              </th>
            </tr>
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
            </tr>
            <tr>
              <td colSpan={2}>No</td>
              <td colSpan={2} style={{ textAlign: "right" }}>{receiptNoteNumber}</td>
            </tr>
            <tr>
              <td colSpan={2}>Kasir</td>
              <td colSpan={2} style={{ textAlign: "right" }}>{username}</td>
            </tr>
            <tr>
              <td colSpan={2}>Tgl</td>
              <td colSpan={2} style={{ textAlign: "right" }}>{formatDate(date)}</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => {
              const packageDescriptions = isPackageItem(item)
                ? parsePackageDescriptions(item.descriptions)
                : [];

              return (
                <React.Fragment key={`${item.variant_id}-${index}`}>
                  <tr>
                    <td colSpan={4} style={{ fontWeight: "bold" }}>
                      {formatProductName(item.name, item.weight_grams)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ paddingLeft: "15px", color: "#666" }}>
                      {item.quantity}x {rupiahFormat(item.price)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {rupiahFormat(item.subtotal)}
                    </td>
                  </tr>
                  {packageDescriptions.length > 0 && (
                    <tr>
                      <td colSpan={4} className="receipt-package-list">
                        <div>Isi paket:</div>
                        <ul>
                          {packageDescriptions.map((description, descriptionIndex) => (
                            <li key={`${item.variant_id}-desc-${descriptionIndex}`}>
                              {description}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
            </tr>
            <tr>
              <td colSpan={2}>Pembayaran</td>
              <td colSpan={2} style={{ textAlign: "right", fontWeight: "bold" }}>
                {paymentMethod?.toUpperCase()}
              </td>
            </tr>
            {isShopeeOrder && shopeeCode && (
              <>
                <tr>
                  <td colSpan={4}>Shopee Code:</td>
                </tr>
                <tr className="shopee-code">
                  <td colSpan={4} style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
                    {shopeeCode}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
            </tr>
            <tr style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              <td colSpan={2}>TOTAL</td>
              <td colSpan={2} style={{ textAlign: "right" }}>
                {rupiahFormat(total)}
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
            </tr>
            <tr>
              <td colSpan={2}>Tunai</td>
              <td colSpan={2} style={{ textAlign: "right" }}>
                {rupiahFormat(cash)}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>Kembalian</td>
              <td colSpan={2} style={{ textAlign: "right" }}>
                {rupiahFormat(change)}
              </td>
            </tr>

            {/* KONDISIONAL: RESELLER */}
            {is_reseller && reseller && (
              <>
                <tr>
                  <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ fontWeight: "bold" }}>RESELLER</td>
                </tr>
                <tr>
                  <td colSpan={2}>Nama</td>
                  <td colSpan={2} style={{ textAlign: "right" }}>{reseller.name}</td>
                </tr>
                <tr>
                  <td colSpan={2}>HP</td>
                  <td colSpan={2} style={{ textAlign: "right" }}>{reseller.phone || "-"}</td>
                </tr>
                <tr>
                  <td colSpan={4}>Alamat:</td>
                </tr>
                <tr style={{ textTransform: "none" }}>
                  <td colSpan={4} style={{ paddingLeft: "15px" }}>{reseller.address || "-"}</td>
                </tr>
              </>
            )}

            {/* KONDISIONAL: PEMESAN */}
            {isOnlineOrders && (
              <>
                <tr>
                  <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "4px 0" }}></td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ fontWeight: "bold" }}>PEMESAN</td>
                </tr>
                <tr>
                  <td colSpan={2}>Nama</td>
                  <td colSpan={2} style={{ textAlign: "right" }}>{customerInfo.name || "-"}</td>
                </tr>
                <tr>
                  <td colSpan={2}>HP</td>
                  <td colSpan={2} style={{ textAlign: "right" }}>{customerInfo.phone || "-"}</td>
                </tr>
                <tr>
                  <td colSpan={4}>Alamat:</td>
                </tr>
                <tr style={{ textTransform: "none" }}>
                  <td colSpan={4} style={{ paddingLeft: "15px" }}>{customerInfo.address || "-"}</td>
                </tr>
                {customerInfo.notes && (
                  <>
                    <tr>
                      <td colSpan={4}>Catatan:</td>
                    </tr>
                    <tr style={{ textTransform: "none" }}>
                      <td colSpan={4} style={{ paddingLeft: "15px" }}>{customerInfo.notes}</td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{ borderTop: "1px dashed black", padding: "10px 0 4px 0" }}></td>
            </tr>
            <tr>
              <td colSpan={4} style={{ textAlign: "center", fontWeight: "bold" }}>
                Selamat Menikmati :)
              </td>
            </tr>
            <tr>
              <td colSpan={4} style={{ textAlign: "center", fontSize: "0.75rem", color: "#777", paddingTop: "5px" }}>
                BASRENG POS v1.1
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  },
);
ReceiptHistory.displayName = "ReceiptHistory";
export default ReceiptHistory;
