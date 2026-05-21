import React, { useState, useEffect, useRef } from 'react';
import {
  IonModal,
  IonContent,
  IonText,
  IonSpinner,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { getBranches, getNearestBranch, Branch } from '../hooks/restAPIBranch';

interface LocationBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBranchSelected: (branchId: string, branchName: string) => void;
}

const LocationBranchModal: React.FC<LocationBranchModalProps> = ({ isOpen, onClose, onBranchSelected }) => {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Menunggu lokasi akurat (6 detik)...');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const processIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      startLocationProcess();
    }

    return () => {
      processIdRef.current += 1;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOpen]);

  const startLocationProcess = async () => {
    const processId = processIdRef.current + 1;
    processIdRef.current = processId;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setLoading(true);
    setShowForm(false);
    setSelectedBranchId(undefined);
    setSelectedBranch(undefined);
    setStatusMessage('Menunggu lokasi akurat (6 detik)...');

    // Ambil daftar semua cabang dulu untuk manual selection nanti
    try {
      const allBranches = await getBranches();
      if (processIdRef.current !== processId) return;

      if (Array.isArray(allBranches)) {
        setBranches(allBranches);
      }
    } catch (error) {
      console.error('Gagal mengambil daftar cabang:', error);
    }

    // Tunggu 3 detik sesuai permintaan
    timeoutRef.current = setTimeout(async () => {
      if (processIdRef.current !== processId) return;

      setStatusMessage('Mengambil titik lokasi...');
      
      if (!navigator.geolocation) {
        setStatusMessage('Geolocation tidak didukung oleh browser ini.');
        setLoading(false);
        setShowForm(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (processIdRef.current !== processId) return;

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          setStatusMessage(`Lokasi akurat terdeteksi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Mencari cabang terdekat...`);
          try {
            const nearest = await getNearestBranch(latitude, longitude);
            if (processIdRef.current !== processId) return;

            if (nearest && nearest.branch_id) {
              setSelectedBranchId(String(nearest.branch_id));
              setSelectedBranch(nearest);
              setBranches(prevBranches => {
                const branchExists = prevBranches.some(
                  branch => String(branch.branch_id) === String(nearest.branch_id)
                );

                return branchExists ? prevBranches : [nearest, ...prevBranches];
              });
              setStatusMessage('Cabang terdekat ditemukan!');
            } else {
              setStatusMessage('Tidak ada cabang dalam radius 100m. Silahkan pilih manual.');
            }
          } catch (error) {
            console.error('Error fetching nearest branch:', error);
            setStatusMessage('Gagal mencari cabang terdekat. Silahkan pilih manual.');
          } finally {
            setLoading(false);
            setShowForm(true);
          }
        },
        (error) => {
          if (processIdRef.current !== processId) return;

          console.error('Geolocation error:');
          setStatusMessage('Silahkan pilih Cabang:');
          setLoading(false);
          setShowForm(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 3000);
  };

  const handleConfirm = () => {
    if (!selectedBranchId) return;

    const branchToConfirm = branches.find(b => String(b.branch_id) === String(selectedBranchId)) || selectedBranch;
    if (branchToConfirm && branchToConfirm.branch_id && branchToConfirm.branch_name) {
      onBranchSelected(String(branchToConfirm.branch_id), branchToConfirm.branch_name);
      onClose();
      return;
    }

    setStatusMessage('Data cabang belum lengkap. Silahkan pilih cabang dari daftar.');
  };

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find(b => String(b.branch_id) === String(branchId));
    setSelectedBranchId(branchId);
    setSelectedBranch(branch);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} backdropDismiss={false}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pilih Cabang</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <div style={{ marginTop: '10%', padding: '20px' }}>
          <IonText color="primary">
            <h2>Menentukan Lokasi Cabang</h2>
          </IonText>
          
          {loading && (
            <div style={{ marginTop: '30px' }}>
              <IonSpinner name="crescent" style={{ width: '60px', height: '60px' }} />
              <p>{statusMessage}</p>
            </div>
          )}

          {showForm && (
            <div style={{ marginTop: '30px' }}>
              <p>{statusMessage}</p>
              <IonItem lines="full" style={{ marginTop: '20px' }}>
                <IonLabel position="stacked">Pilih Cabang</IonLabel>
                <IonSelect 
                  value={selectedBranchId} 
                  placeholder="Pilih Cabang"
                  onIonChange={e => handleBranchChange(e.detail.value)}
                >
                  {branches.map(branch => (
                    <IonSelectOption key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
          )}
        </div>
      </IonContent>
      {showForm && (
        <IonFooter>
          <IonToolbar>
            <IonButton 
              expand="full" 
              onClick={handleConfirm} 
              disabled={!selectedBranchId}
              color="primary"
            >
              OK - Pilih Cabang
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonModal>
  );
};

export default LocationBranchModal;
