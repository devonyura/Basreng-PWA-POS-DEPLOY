import React, { useRef, useState } from "react";
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import { businessOutline, chevronDownOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Branch, getBranches } from "../hooks/restAPIBranch";
import "./FloatingBranchBadge.css";

const FloatingBranchBadge: React.FC = () => {
  const location = useLocation();
  const { token, branchID, branchData, setBranchAfterLocation } = useAuth();
  const branchSelectRef = useRef<HTMLIonSelectElement>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const isLoginPage = location.pathname === "/login";

  if (!token || isLoginPage) {
    return null;
  }

  const selectedBranchId = branchData?.branch_id
    ? String(branchData.branch_id)
    : branchID
      ? String(branchID)
      : undefined;
  const selectedBranchFromList = branches.find(
    (branch) => String(branch.branch_id) === selectedBranchId,
  );
  const branchName =
    branchData?.branch_name || selectedBranchFromList?.branch_name || "Pilih Cabang";

  const openBranchSelect = async () => {
    if (isLoadingBranches) return;

    if (branches.length > 0) {
      branchSelectRef.current?.open();
      return;
    }

    setIsLoadingBranches(true);
    try {
      const branchList = await getBranches();
      const nextBranches = Array.isArray(branchList) ? branchList : [];

      setBranches(() => {
        if (
          branchData?.branch_id &&
          branchData.branch_name &&
          !nextBranches.some(
            (branch) => String(branch.branch_id) === String(branchData.branch_id),
          )
        ) {
          return [branchData, ...nextBranches];
        }

        return nextBranches;
      });

      requestAnimationFrame(() => {
        branchSelectRef.current?.open();
      });
    } catch (error) {
      console.error("Gagal memuat daftar cabang:", error);
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleBranchChange = (branchId?: string) => {
    if (!branchId) return;

    const selectedBranch = branches.find(
      (branch) => String(branch.branch_id) === String(branchId),
    );

    if (!selectedBranch?.branch_id || !selectedBranch.branch_name) return;

    setBranchAfterLocation(String(selectedBranch.branch_id), {
      branch_id: String(selectedBranch.branch_id),
      branch_name: selectedBranch.branch_name,
      branch_address: selectedBranch.branch_address,
      latitude: selectedBranch.latitude,
      longitude: selectedBranch.longitude,
    });
  };

  return (
    <>
      <IonButton
        className="floating-branch-badge"
        fill="solid"
        size="small"
        onClick={openBranchSelect}
        aria-label={`Cabang aktif: ${branchName}. Klik untuk mengganti cabang.`}
      >
        <IonIcon icon={businessOutline} aria-hidden="true" />
        <IonText className="floating-branch-badge__text">
          <span>Cabang</span>
          <strong>{isLoadingBranches ? "Memuat..." : branchName}</strong>
        </IonText>
        <IonIcon icon={chevronDownOutline} aria-hidden="true" />
      </IonButton>

      <IonSelect
        ref={branchSelectRef}
        className="floating-branch-select-host"
        interface="popover"
        value={selectedBranchId}
        aria-label="Pilih cabang aktif"
        onIonChange={(event) => handleBranchChange(event.detail.value)}
      >
        {branches.map((branch) => (
          <IonSelectOption key={branch.branch_id} value={String(branch.branch_id)}>
            {branch.branch_name}
          </IonSelectOption>
        ))}
      </IonSelect>
    </>
  );
};

export default FloatingBranchBadge;
