import {
  IonModal,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { resetUserPassword, ResetPasswordPayload, getUsers, User } from '../../hooks/restAPIUsers';

interface ResetPasswordFormProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  isOpen,
  onDidDismiss,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch users
      const fetchUsers = async () => {
        const data = await getUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Error fetching users:', data);
        }
      };
      fetchUsers();

      // Reset field ketika form dibuka
      setUsername('');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleResetPassword = async () => {
    const uname = username.trim();
    const oldPass = oldPassword.trim();
    const newPass = newPassword.trim();
    const confirmPass = confirmNewPassword.trim();

    if (!uname || !oldPass || !newPass || !confirmPass) {
      setErrorMessage('Semua kolom wajib diisi.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMessage('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    try {
      const payload: ResetPasswordPayload = {
        username: uname,
        old_password: oldPass,
        new_password: newPass
      };
      await resetUserPassword(payload);
      onDidDismiss();
      onSuccess?.();
    } catch (err) {
      console.error('Gagal reset password:', err);
      setErrorMessage('Terjadi kesalahan saat mereset password.');
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <div style={{ padding: 16 }}>
        <h2>Reset Password</h2>

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Username</IonLabel>
            <IonSelect
              value={username}
              placeholder="Pilih User"
              onIonChange={(e) => setUsername(e.detail.value)}
            >
              {users.map((user) => (
                <IonSelectOption key={user.id} value={user.username}>
                  {user.username}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password Lama</IonLabel>
            <IonInput
              type="password"
              value={oldPassword}
              onIonInput={(e) => setOldPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Password Baru</IonLabel>
            <IonInput
              type="password"
              value={newPassword}
              onIonInput={(e) => setNewPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Konfirmasi Password Baru</IonLabel>
            <IonInput
              type="password"
              value={confirmNewPassword}
              onIonInput={(e) => setConfirmNewPassword(e.detail.value!)}
            />
          </IonItem>
        </IonList>

        {errorMessage && (
          <IonText color="danger">
            <p>{errorMessage}</p>
          </IonText>
        )}

        <div style={{ marginTop: 16 }}>
          <IonButton onClick={handleResetPassword}>Simpan</IonButton>
          <IonButton color="medium" onClick={onDidDismiss}>Batal</IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default ResetPasswordForm;
