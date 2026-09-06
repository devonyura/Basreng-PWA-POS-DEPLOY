import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar,
  IonImg,
  IonInputPasswordToggle,
  IonSegment,
  IonToast,
  IonText,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonAlert,
} from "@ionic/react";
import "./LoginForm.css";
import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { loginRequest } from "../hooks/restAPIRequest";
import { useAuth } from "../hooks/useAuthCookie";
import { warning } from "ionicons/icons";
import AlertInfo, { AlertState } from "../components/AlertInfo";
import { Branch, getBranches } from "../hooks/restAPIBranch";

interface LocationState {
  isTokenExpired?: boolean;
  dontRefresh?: boolean;
}

const LoginForm: React.FC = () => {
  // setup Alert
  const [alert, setAlert] = useState<AlertState>({
    showAlert: false,
    header: "",
    alertMesage: "",
    hideButton: false,
  });

  const { login, token, setBranchAfterLocation } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [isTokenExpired, setIsTokenExpired] = useState(
    location.state?.isTokenExpired || false,
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>();
  const [selectedBranchName, setSelectedBranchName] = useState<string>("");
  const [selectedBranchData, setSelectedBranchData] = useState<Branch | undefined>();
  const [showBranchSelect, setShowBranchSelect] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState("");
  const [showBranchConfirmation, setShowBranchConfirmation] = useState(false);
  
  const resetForm = () => {
    setUsername("");
    setPassword("");
  };

  const checkForm = (name: string, value: any) => {
    if (value === null || !value) {
      setAlert({
        showAlert: true,
        header: "Peringatan",
        alertMesage: "Isian " + name + " tidak boleh kosong!",
      });

      return false;
    }
    return true;
  };

  const handleOpenBranchSelect = async () => {
    setShowBranchSelect(true);
    setBranchError("");

    if (branches.length > 0 || isLoadingBranches) return;

    setIsLoadingBranches(true);
    try {
      const branchList = await getBranches();
      if (Array.isArray(branchList)) {
        setBranches(branchList);
        if (branchList.length === 0) {
          setBranchError("Daftar cabang kosong. Silahkan coba lagi.");
        }
      } else {
        setBranchError("Gagal memuat daftar cabang. Silahkan coba lagi.");
      }
    } catch (error) {
      console.error("Gagal mengambil daftar cabang:", error);
      setBranchError("Gagal memuat daftar cabang. Silahkan coba lagi.");
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find(
      (item) => String(item.branch_id) === String(branchId),
    );

    setSelectedBranchId(branchId);
    setSelectedBranchName(branch?.branch_name || "");
    setSelectedBranchData(branch);
  };

  const processLogin = async () => {
    const authData = { username, password, branch_id: selectedBranchId };

    setAlert({
      showAlert: true,
      header: "Sedang Login",
      alertMesage: "Tunggu Sebentar...",
      hideButton: true,
    });

    try {
      const result = await loginRequest(authData);

      if (result.success) {
          const token = result.data.token;

          // tutup alert loading
          setAlert({
            showAlert: false,
            header: "",
            alertMesage: "",
            hideButton: false,
          });

          login(token);
          if (selectedBranchData?.branch_id) {
            setBranchAfterLocation(String(selectedBranchData.branch_id), selectedBranchData);
          }
          setIsTokenExpired(false);

          setTimeout(() => {
            history.replace("/dashboard");
          }, 100);
        } else {
        setAlert({
          showAlert: true,
          header: "Gagal!",
          alertMesage: result.error,
        });
      }
    } catch (error: any) {
      setAlert({
        showAlert: true,
        header: "Gagal!",
        alertMesage: "Username / Password Salah atau jaringan bermasalah",
      });
    }

    resetForm();
  };

  const handleLogin = () => {
    const authData = { username, password, branch_id: selectedBranchId };

    if (
      !checkForm("Username", authData.username) ||
      !checkForm("Password", authData.password)
    ) {
      return;
    }

    if (!authData.branch_id) {
      setAlert({
        showAlert: true,
        header: "Peringatan",
        alertMesage: "Lokasi Cabang belum dipilih!",
      });
      return;
    }

    setShowBranchConfirmation(true);
  };

  useEffect(() => {
    if (token) {
      history.replace("/dashboard", { isTokenExpired: true });
    }
  }, [token, history, isTokenExpired]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Basreng POS</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding login-content">
        <IonImg src="/icon.png" className="app-logo" alt="App Logo" />
        {isTokenExpired ? (
          <IonToast
            isOpen={true}
            message={
              isTokenExpired
                ? "Sessi habis. Silahkan Login Kembali!"
                : "Kamu Sudah Login!"
            }
            duration={6000}
            position="middle"
            swipeGesture="vertical"
            icon={warning}
            buttons={[
              {
                text: "Dismiss",
                role: "cancel",
              },
            ]}
          ></IonToast>
        ) : (
          ""
        )}
        <IonSegment className="login-container">
          <IonText>
            <h3>Masuk</h3>
          </IonText>
          <IonItem>
            <IonInput
              label="Username"
              placeholder="Masukkan Username"
              value={username}
              onIonInput={(e) => setUsername(e.detail.value!)}
              className="username-input"
              autocapitalize="off"
              autocorrect="off"
              spellcheck={false}
              inputmode="text"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Password"
              placeholder="Masukkan Password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value!)}
              type="password"
            >
              <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            </IonInput>
          </IonItem>
          <IonButton
            onClick={handleOpenBranchSelect}
            expand="full"
            shape="round"
            color="primary"
            disabled={isLoadingBranches}
          >
            {isLoadingBranches ? <IonSpinner name="crescent" /> : selectedBranchName || "Pilih Cabang (Wajib)"}
          </IonButton>
          {showBranchSelect && !isLoadingBranches && (
            <IonItem>
              <IonSelect
                label="Lokasi Cabang"
                labelPlacement="stacked"
                value={selectedBranchId}
                placeholder={branchError || "Pilih Cabang"}
                onIonChange={(event) => handleBranchChange(event.detail.value)}
                interface="popover"
                disabled={branches.length === 0}
              >
                {branches.map((branch) => (
                  <IonSelectOption key={branch.branch_id} value={branch.branch_id}>
                    {branch.branch_name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}
          <IonButton
            expand="full"
            shape="round"
            className="login-button"
            color="secondary"
            onClick={handleLogin}
          >
            Masuk
          </IonButton>
        </IonSegment>
      </IonContent>

      <AlertInfo
        isOpen={alert.showAlert}
        header={alert.header}
        message={alert.alertMesage}
        onDidDismiss={() =>
          setAlert((prevState) => ({ ...prevState, showAlert: false }))
        }
        hideButton={alert.hideButton}
      />
      <IonAlert
        isOpen={showBranchConfirmation}
        header="Konfirmasi Lokasi"
        message={`Yakin Lokasi kamu sekarang ${selectedBranchName}?`}
        buttons={[
          {
            text: "Batal",
            role: "cancel",
            handler: () => setShowBranchConfirmation(false),
          },
          {
            text: "Yakin",
            role: "confirm",
            handler: () => {
              setShowBranchConfirmation(false);
              void processLogin();
            },
          },
        ]}
        onDidDismiss={() => setShowBranchConfirmation(false)}
      />
    </IonPage>
  );
};

export default LoginForm;
