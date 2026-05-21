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
import { getBranches, Branch } from '../hooks/restAPIBranch';

interface LocationBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBranchSelected: (branchId: string, branchName: string, branchData?: Branch) => void;
}

const LocationBranchModal: React.FC<LocationBranchModalProps> = ({ isOpen, onClose, onBranchSelected }) => {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Memuat daftar cabang...');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    if (isOpen) {
      loadBranches(() => cancelled);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const loadBranches = async (isCancelled: () => boolean) => {
    setLoading(true);
    setSelectedBranchId(undefined);
    setStatusMessage('Memuat daftar cabang...');

    try {
      const allBranches = await getBranches();
      if (isCancelled()) return;

      if (Array.isArray(allBranches)) {
        setBranches(allBranches);
        setStatusMessage(
          allBranches.length > 0
            ? 'Silahkan pilih cabang.'
            : 'Daftar cabang kosong. Silahkan coba lagi.'
        );
      } else {
        setBranches([]);
        setStatusMessage('Gagal memuat daftar cabang. Silahkan coba lagi.');
      }
    } catch (error) {
      console.error('Gagal mengambil daftar cabang:', error);
      if (!isCancelled()) {
        setBranches([]);
        setStatusMessage('Gagal memuat daftar cabang. Silahkan coba lagi.');
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedBranchId) return;

    const branchToConfirm = branches.find(b => String(b.branch_id) === String(selectedBranchId));
    if (branchToConfirm && branchToConfirm.branch_id && branchToConfirm.branch_name) {
      onBranchSelected(String(branchToConfirm.branch_id), branchToConfirm.branch_name, branchToConfirm);
      handleClose();
      return;
    }

    setStatusMessage('Data cabang belum lengkap. Silahkan pilih cabang dari daftar.');
  };

  const handleClose = () => {
    onClose();
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pilih Cabang</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <div style={{ marginTop: '10%', padding: '20px' }}>
          <IonText color="primary">
            <h2>Pilih Cabang</h2>
          </IonText>
          
          {loading && (
            <div style={{ marginTop: '30px' }}>
              <IonSpinner name="crescent" style={{ width: '60px', height: '60px' }} />
              <p>{statusMessage}</p>
            </div>
          )}

          {!loading && (
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
      {!loading && (
        <IonFooter>
          <IonToolbar>
            <IonButton 
              expand="full" 
              onClick={handleConfirm} 
              disabled={!selectedBranchId || branches.length === 0}
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
