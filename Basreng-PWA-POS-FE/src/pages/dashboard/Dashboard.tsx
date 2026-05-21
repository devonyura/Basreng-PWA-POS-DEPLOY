import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonRow,
  IonList,
  IonItem,
  IonButtons,
  IonMenuButton,
  IonAlert,
  IonText,
  IonChip,
  IonSpinner,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { statsChart, cashOutline, refresh } from "ionicons/icons";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Pie,
  PieChart,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthCookie";
import AlertInfo, { AlertState } from "../../components/AlertInfo";
import "./Dashboard.css";
import {
  TopSelling,
  getTransactionSummary,
  getIncomeByBranch,
  getTopSellingProduct,
  getTransactionsReport,
  BranchIncome,
} from "../../hooks/restAPIDashboard";
import { formatProductWithWeight, rupiahFormat, formatDateLocal } from "../../hooks/formatting";
import DashboardMenu from "../../components/DashboardMenu";
import { generateDailyReport } from "../../utils/generateDailyReport";

interface LocationState {
  isTokenExpired?: boolean;
  dontRefresh?: boolean;
}

export interface Summary {
  total_sales: number;
  bulan_ini: number;
  total_transactions: number;
  minggu_ini: number;
  payment_summary: {
    cash?: number;
    transfer_bank: number;
    qris: number;
    shopee: number;
  };
}

const Dashboard: React.FC = () => {
  const [isViewActive, setIsViewActive] = useState(true);

  useIonViewDidEnter(() => {
    setIsViewActive(true);
  });

  useIonViewDidLeave(() => {
    setIsViewActive(false);
  });
  
  const [summary, setSummary] = useState<Summary>();

  const [incomeByBranch, setIncomeByBranch] = useState<BranchIncome[]>([]);
  const [topSellingProduct, setTopSellingProduct] = useState<
    {
      name: string;
      total_sold: number;
      total_sales: number;
    }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [errorChart, setErrorChart] = useState<string | null>(null);
  const { logout, role, username, branchID, token, branchData } = useAuth();

  const normalizeArrayResponse = <T,>(response: T[] | { data?: T[] } | null | undefined): T[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  const fetchData = async () => {
    console.log("username", username);
    setLoading(true);
    setLoadingChart(true);
    setError(null);
    setErrorChart(null);
    try {
      try {
        const summaryData = await getTransactionSummary();
        console.log("summaryData:", summaryData);
        if (summaryData) {
          setSummary(summaryData);
        }
      } catch (e) {
        console.warn("Gagal ambil ringkasan transaksi:", e);
      }

      try {
        const incomeData = await getIncomeByBranch();
        setIncomeByBranch(normalizeArrayResponse<BranchIncome>(incomeData));
      } catch (e) {
        console.warn("Gagal ambil pendapatan cabang:", e);
        setIncomeByBranch([]);
      }

      try {
        const res = await getTopSellingProduct(5);
        const pieData = normalizeArrayResponse<TopSelling>(res).map((item: TopSelling) => ({
          name: formatProductWithWeight(item.product_name, item.weight_grams),
          total_sold: Number(item.total_sold || 0),
          total_sales: Number(item.total_sales || 0),
        }));
        setTopSellingProduct(pieData);
      } catch (e) {
        console.warn("Gagal ambil produk terlaris:", e);
        setTopSellingProduct([]);
      }

      try {
        const response = await getTransactionsReport(7);
        // Pastikan total_sales dikonversi ke number
        console.log("Chart API response:", response); // 👉 cek isi response
        // Asumsikan response adalah array langsung, kalau tidak kita perbaiki
        const formatted = normalizeArrayResponse<any>(response).map((item: any) => ({
          date: item.date,
          total_sales: parseFloat(item.total_sales || 0),
        }));
        setChartData(formatted);
        console.log(chartData);
      } catch (error: any) {
        setErrorChart(error.message || "Gagal memuat chart");
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal memuat sebagian data dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role) {
      fetchData();
    } else {
      setLoading(false);
      setLoadingChart(false);
    }
  }, [token, role]);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await fetchData();
    } finally {
      event.detail.complete();
    }
  };

  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  const history = useHistory();
  const location = useLocation<LocationState>();
  // const [isTokenExpired, setIsTokenExpired] = useState(
  //   location.state?.isTokenExpired || false,
  // );
  useEffect(() => {
  if (location.state?.isTokenExpired) {
    // beri delay kecil agar page & overlay selesai render
    const timer = setTimeout(() => {
      setAlert({
        showAlert: true,
        header: "Info",
        alertMesage: "Kamu sudah login!",
        hideButton: false,
      });

      // reset state supaya tidak muncul lagi saat refresh
      history.replace({
        ...location,
        state: {},
      });
    }, 300);

    return () => clearTimeout(timer);
  }
}, [location.state, history]);

  const [showLogoutAlert, setLogoutShowAlert] = useState(false);

  const COLORS = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];

  const handleLogout = () => {
    logout();
  };

  const isKasir = role === "kasir";

  return (
    <>
      <DashboardMenu onLogout={() => setLogoutShowAlert(true)} role={role} />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>
              📊 Ringkasan Hari ini{" "}
              {isKasir ? "(Kasir)" : `Admin Menu ${role ?? ""}`}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={fetchData}>
                <IonIcon icon={refresh} />
              </IonButton>
              {["owner", "admin", "manager"].includes(role ?? "") && (
                <IonButton
                  onClick={async () => {
                    const allProducts = await getTopSellingProduct("all");

                    generateDailyReport({
                      summary: summary,
                      branches: incomeByBranch,
                      products: allProducts.map((item: any) => ({
                        product_name: formatProductWithWeight(
                          item.product_name || "-",
                          item.weight_grams,
                        ),
                        total_sold: Number(item.total_sold || 0),
                        total_sales: Number(item.total_sales || 0),
                      })),
                      date: formatDateLocal(),
                    });
                  }}
                >
                  Export PDF
                </IonButton>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Ringkasan Hari ini</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonGrid className="dashboard-grid">
            <IonRow>
              {/* Kolom Utama / Kiri (Wider screens: 8/12, Mobile: 12/12) */}
              <IonCol size="12" sizeLg="8">
                {/* Ringkasan Penjualan */}
                <IonCard className="summary-card ion-no-margin-bottom">
                  <IonGrid>
                    <IonRow className="ion-align-items-center ion-padding-top">
                      <IonCol size="3" className="icon-card ion-text-center">
                        <IonIcon icon={statsChart} color="primary" style={{ fontSize: '3.5rem' }}></IonIcon>
                      </IonCol>
                      <IonCol size="9">
                        <IonCardHeader style={{ padding: '0 0 4px 0' }}>
                          <IonCardTitle style={{ fontSize: '1rem', color: 'var(--ion-color-medium)', fontWeight: 600 }}>TRANSAKSI HARI INI</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent style={{ padding: 0 }}>
                          <div className="details-card">
                            <h5 style={{ margin: '4px 0', fontSize: '0.95rem' }}>
                              {isKasir ? "Transaksi Cabang Kamu" : "Semua Cabang"}
                            </h5>
                            {branchData?.branch_name && (
                              <p style={{ margin: "2px 0 8px 0", color: "var(--ion-color-medium)", fontSize: "0.85rem" }}>
                                Lokasi: <strong>{branchData.branch_name}</strong>
                              </p>
                            )}
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0', color: 'var(--ion-color-primary)' }}>
                              {rupiahFormat(summary?.total_sales || 0)}
                            </h2>
                            <h4 style={{ margin: '4px 0', fontSize: '0.95rem', fontWeight: 500 }}>
                              Dari <strong style={{ color: 'var(--ion-color-dark)', fontWeight: 700 }}>{summary?.total_transactions || 0}</strong> Transaksi
                            </h4>
                          </div>
                        </IonCardContent>
                      </IonCol>
                    </IonRow>

                    {summary?.payment_summary && (
                      <IonRow className="ion-padding-top ion-padding-bottom">
                        <IonCol size="12">
                          <h4 style={{ fontSize: "1rem", margin: "16px 0 8px 0", fontWeight: 700, color: "var(--ion-color-dark)", borderTop: "1px solid rgba(233,226,216,0.6)", paddingTop: "12px" }}>
                            💳 Ringkasan Pembayaran
                          </h4>
                          <IonGrid className="payment-summary-grid">
                            <IonRow>
                              <IonCol size="6" sizeSm="3">
                                <div className="payment-box cash">
                                  <span className="payment-label">Tunai</span>
                                  <span className="payment-val text-success">{rupiahFormat(summary.payment_summary.cash || 0)}</span>
                                </div>
                              </IonCol>
                              <IonCol size="6" sizeSm="3">
                                <div className="payment-box transfer">
                                  <span className="payment-label">Transfer Bank</span>
                                  <span className="payment-val text-primary">{rupiahFormat(summary.payment_summary.transfer_bank || 0)}</span>
                                </div>
                              </IonCol>
                              <IonCol size="6" sizeSm="3">
                                <div className="payment-box qris">
                                  <span className="payment-label">QRIS</span>
                                  <span className="payment-val text-tertiary">{rupiahFormat(summary.payment_summary.qris || 0)}</span>
                                </div>
                              </IonCol>
                              <IonCol size="6" sizeSm="3">
                                <div className="payment-box shopee">
                                  <span className="payment-label">Shopee</span>
                                  <span className="payment-val text-warning">{rupiahFormat(summary.payment_summary.shopee || 0)}</span>
                                </div>
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </IonCol>
                      </IonRow>
                    )}
                  </IonGrid>
                </IonCard>

                {/* Pendapatan per Cabang (Admin) */}
                {!isKasir && (
                  <IonCard className="branch-card">
                    <IonCardHeader>
                      <IonCardTitle>🏪 Pendapatan per Cabang</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                          <IonSpinner name="crescent" color="primary" />
                        </div>
                      ) : (
                        <div className="branch-list-wrapper">
                          {incomeByBranch.map((branch, idx) => (
                            <div key={idx} className="branch-income-item">
                              <div className="branch-income-header">
                                <span className="branch-name">🏪 {branch.branch_name}</span>
                                <span className="branch-total">{rupiahFormat(Number(branch.total_income || 0))}</span>
                              </div>
                              <p className="branch-meta">
                                Total: <strong>{branch.total_transactions}</strong> transaksi
                              </p>
                              <div className="branch-payment-details">
                                <span className="p-chip cash">Cash: {rupiahFormat(Number(branch.total_income_cash || 0))}</span>
                                <span className="p-chip transfer">Transfer: {rupiahFormat(Number(branch.total_income_transfer_bank || 0))}</span>
                                <span className="p-chip qris">QRIS: {rupiahFormat(Number(branch.total_income_qris || 0))}</span>
                                <span className="p-chip shopee">Shopee: {rupiahFormat(Number(branch.total_income_shopee || 0))}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                )}

                {/* Omset 7 Hari Terakhir Chart */}
                {!isKasir && (
                  <IonCard className="chart-card">
                    <IonCardHeader>
                      <IonCardTitle>📈 Omset 7 Hari Terakhir</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {loadingChart && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                          <IonSpinner name="crescent" color="primary" />
                        </div>
                      )}
                      {errorChart && (
                        <p style={{ color: "var(--ion-color-danger)", textAlign: 'center' }}>{errorChart}</p>
                      )}

                      {!loadingChart && !errorChart && isViewActive && (
                        <div style={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                              <CartesianGrid stroke="rgba(233, 226, 216, 0.4)" strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="date"
                                angle={-30}
                                textAnchor="end"
                                tick={{ fill: 'var(--ion-color-dark)', fontSize: 11, fontWeight: 500 }}
                                axisLine={{ stroke: 'rgba(233, 226, 216, 0.8)' }}
                                tickLine={false}
                              />
                              <YAxis
                                tickFormatter={(value) => `${value / 1_000_000}jt`}
                                tick={{ fill: 'var(--ion-color-dark)', fontSize: 11 }}
                                axisLine={{ stroke: 'rgba(233, 226, 216, 0.8)' }}
                                tickLine={false}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: '#ffffff',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(233, 226, 216, 0.8)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                                }}
                                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total Sales']}
                              />
                              <Bar
                                dataKey="total_sales"
                                fill="var(--ion-color-primary)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={48}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                )}
              </IonCol>

              {/* Kolom Samping / Kanan (Wider screens: 4/12, Mobile: 12/12) */}
              <IonCol size="12" sizeLg="4">
                {/* Ringkasan Omset */}
                {!isKasir && (
                  <IonCard className="omset-card">
                    <IonCardHeader>
                      <IonCardTitle>🧾 Ringkasan Omset</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                          <IonSpinner name="dots" color="primary" />
                        </div>
                      ) : (
                        <div className="omset-chips-container">
                          <div className="omset-box week">
                            <span className="omset-icon">📅</span>
                            <div className="omset-info">
                              <span className="omset-label">Minggu Ini</span>
                              <span className="omset-value">{rupiahFormat(summary?.minggu_ini || 0)}</span>
                            </div>
                          </div>
                          <div className="omset-box month">
                            <span className="omset-icon">📊</span>
                            <div className="omset-info">
                              <span className="omset-label">Bulan Ini</span>
                              <span className="omset-value">{rupiahFormat(summary?.bulan_ini || 0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                )}

                {/* 5 Produk Terlaris */}
                {!isKasir && (
                  <IonCard className="pie-card">
                    <IonCardHeader>
                      <IonCardTitle>🔥 5 Produk Terlaris Hari Ini</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                          <IonSpinner name="crescent" color="primary" />
                        </div>
                      ) : topSellingProduct.length > 0 && isViewActive ? (
                        <div style={{ width: "100%", height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={topSellingProduct}
                                dataKey="total_sold"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                fill="#8884d8"
                                labelLine={false}
                                label={({ name, percent }) => `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`}
                              >
                                {topSellingProduct.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  background: '#ffffff',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(233, 226, 216, 0.8)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>Belum ada data produk terlaris.</p>
                      )}
                    </IonCardContent>
                  </IonCard>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
          {/* Error Message */}
          <IonToast
            isOpen={!!error}
            message={error!}
            duration={3000}
            color="danger"
            onDidDismiss={() => setError(null)}
          />
        </IonContent>

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setLogoutShowAlert(false)}
          header="Konfirmasi"
          message="Yakin ingin Logout akun?"
          buttons={[
            {
              text: "Batal",
              role: "cancel",
            },
            {
              text: "Keluar",
              handler: handleLogout,
            },
          ]}
        />

        <AlertInfo
          isOpen={alert.showAlert}
          header={alert.header}
          message={alert.alertMesage}
          onDidDismiss={() =>
            setAlert((prevState) => ({ ...prevState, showAlert: false }))
          }
          hideButton={alert.hideButton}
        />
      </IonPage>
    </>
  );
};

export default Dashboard;
