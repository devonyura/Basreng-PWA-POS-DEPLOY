import React, { useState, useEffect } from 'react';
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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startLocationProcess();
    }
  }, [isOpen]);

  const startLocationProcess = async () => {
    setLoading(true);
    setShowForm(false);
    setStatusMessage('Menunggu lokasi akurat (6 detik)...');

    // Ambil daftar semua cabang dulu untuk manual selection nanti
    try {
      const allBranches = await getBranches();
      if (Array.isArray(allBranches)) {
        setBranches(allBranches);
      }
    } catch (error) {
      console.error('Gagal mengambil daftar cabang:', error);
    }

    // Tunggu 6 detik sesuai permintaan
    // setTimeout(async () => {
      // setStatusMessage('Mengambil titik lokasi...');
      
      // if (!navigator.geolocation) {
      //   setStatusMessage('Geolocation tidak didukung oleh browser ini.');
      //   setLoading(false);
      //   setShowForm(true);
      //   return;
      // }

      // navigator.geolocation.getCurrentPosition(
      //   async (position) => {
      //     const latitude = position.coords.latitude;
      //     const longitude = position.coords.longitude;
          
      //     setStatusMessage(`Lokasi akurat terdeteksi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Mencari cabang terdekat...`);
      //     try {
      //       const nearest = await getNearestBranch(latitude, longitude);
      //       if (nearest && nearest.branch_id) {
      //         setSelectedBranchId(nearest.branch_id);
      //         setStatusMessage('Cabang terdekat ditemukan!');
      //       } else {
      //         setStatusMessage('Tidak ada cabang dalam radius 100m. Silahkan pilih manual.');
      //       }
      //     } catch (error) {
      //       console.error('Error fetching nearest branch:', error);
      //       setStatusMessage('Gagal mencari cabang terdekat. Silahkan pilih manual.');
      //     } finally {
      //       setLoading(false);
      //       setShowForm(true);
      //     }
      //   },
      //   (error) => {
          console.error('Geolocation error:');
          // setStatusMessage('Gagal mendapatkan lokasi. Silahkan pilih manual.');
          setStatusMessage('Silahkan pilih Cabang:');
          setLoading(false);
          setShowForm(true);
      //   },
      //   { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      // );
    // }, 6000);
  };

  const handleConfirm = () => {
    if (!selectedBranchId) return;

    const selectedBranch = branches.find(b => String(b.branch_id) === String(selectedBranchId));
    if (selectedBranch && selectedBranch.branch_id) {
      onBranchSelected(selectedBranch.branch_id, selectedBranch.branch_name);
    }
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
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
                  onIonChange={e => setSelectedBranchId(e.detail.value)}
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
