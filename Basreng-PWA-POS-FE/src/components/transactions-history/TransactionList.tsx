import { IonList, IonItem, IonLabel, IonIcon, IonButton } from "@ionic/react";
import { time } from "ionicons/icons";

import { rupiahFormat, shortDate } from "../../hooks/formatting";

interface TransactionItem {
  transaction_code: string;
  time: string;
  date: string;
  total_price: number;
  kasir?: string;
  products?: {
    product_name: string;
    category_name: string;
    product_description?: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

interface Props {
  data: TransactionItem[];
  onClickItem: (code: string) => void;
  onReload: () => void;
}

const TransactionList: React.FC<Props> = ({ data, onClickItem, onReload }) => {
  const isPaketTransaction = (item: TransactionItem): boolean => {
    if (!item.products || !Array.isArray(item.products)) return false;
    return item.products.some(
      (p) =>
        p.product_name?.toLowerCase().includes("paket") ||
        p.category_name?.toLowerCase() === "paket"
    );
  };

  return (
    <>
      {Array.isArray(data) && data.length > 0 ? (
        <IonList style={{ background: "transparent", padding: "10px 0" }}>
          {data.map((item) => {
            const isPaket = isPaketTransaction(item);
            return (
              <IonItem
                key={item.transaction_code}
                onClick={() => onClickItem(item.transaction_code)}
                style={
                  isPaket
                    ? {
                        "--background": "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                        "--background-hover": "#fde68a",
                        "borderLeft": "5px solid #d97706",
                        "borderRadius": "12px",
                        "margin": "10px 8px",
                        "boxShadow": "0 4px 6px -1px rgba(217, 119, 6, 0.15), 0 2px 4px -1px rgba(217, 119, 6, 0.08)",
                      }
                    : {
                        "--background": "#ffffff",
                        "borderLeft": "5px solid #cbd5e1",
                        "borderRadius": "12px",
                        "margin": "10px 8px",
                        "boxShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                      }
                }
                lines="none"
              >
                <IonLabel
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: "8px 4px",
                  }}
                >
                  {/* Top Row: Code and Total Price */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        color: isPaket ? "#92400e" : "#1e293b",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.transaction_code}
                    </span>
                    <span
                      style={{
                        color: isPaket ? "#b45309" : "#16a34a",
                        fontWeight: "800",
                        fontSize: "1.05rem",
                      }}
                    >
                      {rupiahFormat(item.total_price)}
                    </span>
                  </div>

                  {/* Subtitle Row: Time, Date & Cashier Pill */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      alignItems: "center",
                      fontSize: "0.8rem",
                      color: isPaket ? "#b45309" : "#64748b",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: "500",
                      }}
                    >
                      <IonIcon icon={time} style={{ fontSize: "0.85rem" }} />
                      {item.time} - {shortDate(item.date)}
                    </span>

                    {item.kasir && (
                      <span
                        style={{
                          backgroundColor: isPaket ? "rgba(217, 119, 6, 0.15)" : "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: isPaket ? "#b45309" : "#475569",
                        }}
                      >
                        Kasir: {item.kasir}
                      </span>
                    )}

                    {isPaket && (
                      <span
                        style={{
                          backgroundColor: "#d97706",
                          color: "#ffffff",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "0.5px",
                        }}
                      >
                        PAKET
                      </span>
                    )}
                  </div>

                  {/* Inset Products Box */}
                  {item.products && item.products.length > 0 && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: isPaket ? "#78350f" : "#334155",
                        lineHeight: "1.4",
                        backgroundColor: isPaket ? "rgba(251, 191, 36, 0.18)" : "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        marginTop: "2px",
                        border: isPaket
                          ? "1px solid rgba(217, 119, 6, 0.25)"
                          : "1px solid #e2e8f0",
                      }}
                    >
                      {item.products.map((p, idx) => {
                        const isProductPaket =
                          p.category_name?.toLowerCase() === "paket" ||
                          p.product_name?.toLowerCase().includes("paket");
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              margin: "6px 0", 
                              borderBottom: idx < (item.products || []).length - 1 ? "1px dashed rgba(0, 0, 0, 0.05)" : "none", 
                              paddingBottom: "6px" 
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontWeight: isProductPaket ? "700" : "400",
                              }}
                            >
                              <span>
                                {p.quantity}x {p.product_name}
                              </span>
                              <span style={{ color: isPaket ? "#92400e" : "#64748b", fontSize: "0.78rem" }}>
                                {rupiahFormat(p.subtotal)}
                              </span>
                            </div>

                            {isProductPaket && p.product_description && (
                              (() => {
                                const descItems = p.product_description
                                  .split(",")
                                  .map((d) => d.trim())
                                  .filter((d) => d.length > 0);
                                if (descItems.length === 0) return null;
                                return (
                                  <div style={{ marginTop: "4px", paddingLeft: "16px" }}>
                                    <ul style={{ 
                                      margin: 0, 
                                      padding: 0, 
                                      listStyleType: "circle", 
                                      fontSize: "0.76rem", 
                                      color: isPaket ? "#78350f" : "#475569",
                                      opacity: 0.9,
                                      fontWeight: "400"
                                    }}>
                                      {descItems.map((desc, dIdx) => (
                                        <li key={dIdx} style={{ margin: "2px 0" }}>
                                          {desc}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      ) : (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>Tidak ada transaksi saat ini</p>
          <IonButton onClick={() => window.location.reload()}>Ambil Ulang Data</IonButton>
        </div>
      )}
    </>
  );
};

export default TransactionList;
