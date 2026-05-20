import { IonToolbar, IonSearchbar, IonButton, IonIcon } from "@ionic/react";
import { time, location } from "ionicons/icons";

interface Props {
  selectedDateFilter: string;
  kasirUsername: string | null;
  selectedBranchName: string;
  isAdmin: boolean;
  isKasirRole: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;

  onOpenDate: () => void;
  onOpenKasir: () => void;
  onOpenBranch: () => void;

  getDateFilterLabel: (filter: string) => string;
}

const TransactionFilterBar: React.FC<Props> = ({
  selectedDateFilter,
  kasirUsername,
  selectedBranchName,
  isAdmin,
  isKasirRole,
  searchQuery,
  onSearchChange,
  onOpenDate,
  onOpenKasir,
  onOpenBranch,
  getDateFilterLabel,
}) => {
  return (
    <>
      <IonToolbar>
        <IonSearchbar
          value={searchQuery}
          onIonInput={(e) => onSearchChange(e.detail.value || "")}
          placeholder="Cari Transaksi"
        />
      </IonToolbar>

      <IonToolbar className="filter-container">
        {/* Date Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin}
          onClick={onOpenDate}
        >
          <IonIcon icon={time} size="small" />
          <span> {getDateFilterLabel(selectedDateFilter)}</span>
        </IonButton>

        {/* Kasir Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin && !isKasirRole}
          onClick={onOpenKasir}
        >
          Kasir : {kasirUsername}
        </IonButton>

        {/* Branch Filter */}
        <IonButton
          size="small"
          color="medium"
          disabled={!isAdmin}
          onClick={onOpenBranch}
        >
          <IonIcon icon={location} size="small" /> : {selectedBranchName}
        </IonButton>
      </IonToolbar>
    </>
  );
};

export default TransactionFilterBar;
