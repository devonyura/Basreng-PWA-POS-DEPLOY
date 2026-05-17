import { IonAlert } from '@ionic/react';
import { useState } from 'react';
import { BranchPayload, createBranch, updateBranch, Branch } from '../../hooks/restAPIBranch';

interface BranchAlertFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
  initialBranch?: {
    branch_id?: string | null;
    branch_name?: string | null;
    branch_address?: string | null;
    latitude?: string | null;
    longitude?: string | null;
  } | null;
}

const BranchAlertForm: React.FC<BranchAlertFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess,
  initialBranch
}) => {
  const [showError, setShowError] = useState(false);

  const handleSave = async (nameInputFromAlert: any) => {
    const nameInput = (nameInputFromAlert.name || '').trim();
    const addressInput = (nameInputFromAlert.address || '').trim();
    const latInput = (nameInputFromAlert.latitude || '').trim();
    const lngInput = (nameInputFromAlert.longitude || '').trim();
    if (!nameInput || !addressInput) {
      setShowError(true);
      return false;
    }

    try {
      const payload: BranchPayload = { 
        branch_name: nameInput, 
        branch_address: addressInput,
        latitude: latInput,
        longitude: lngInput
      };

      if (initialBranch && initialBranch.branch_id) {
        await updateBranch(payload, initialBranch.branch_id);
      } else {
        await createBranch(payload);
      }
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal menyimpan cabang:', err);
      alert('Terjadi kesalahan saat menyimpan cabang.');
    }
    return true;
  };

  return (
    <>
      <IonAlert
        isOpen={isOpen}
        onDidDismiss={onDidDismiss}
        header={initialBranch ? 'Edit Cabang' : 'Tambah Cabang'}
        inputs={[
          {
            name: 'name',
            type: 'text',
            placeholder: 'Nama Cabang',
            value: initialBranch?.branch_name
          },
          {
            name: 'address',
            type: 'text',
            placeholder: 'Alamat Cabang',
            value: initialBranch?.branch_address
          },
          {
            name: 'latitude',
            type: 'text',
            placeholder: 'Latitude',
            value: initialBranch?.latitude
          },
          {
            name: 'longitude',
            type: 'text',
            placeholder: 'Longitude',
            value: initialBranch?.longitude
          }
        ]}
        buttons={[
          {
            text: 'Batal',
            role: 'cancel',
            handler: onDidDismiss
          },
          {
            text: 'Simpan',
            handler: async (data) => {
              return await handleSave(data);
            }
          }
        ]}
      />

      <IonAlert
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        header="Validasi Gagal"
        message="Nama cabang tidak boleh kosong."
        buttons={['OK']}
      />
    </>
  );
};

export default BranchAlertForm;
