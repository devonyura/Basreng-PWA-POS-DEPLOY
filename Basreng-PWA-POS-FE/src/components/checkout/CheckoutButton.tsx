import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { checkmarkCircle, lockClosed } from "ionicons/icons";
import React from "react";

interface Props {
  isSubmitting: boolean;
  cashGiven: number | null;
  onCheckout: () => void;
  paymentMethod: string;
  paymentProof: File | null;
  isShopeeOrder?: boolean;
  shopeeCode?: string | null;
}

const CheckoutButton: React.FC<Props> = ({
  isSubmitting,
  cashGiven,
  onCheckout,
  paymentMethod,
  paymentProof,
  isShopeeOrder = false,
  shopeeCode,
}) => {
  const isPaymentProofRequired =
    paymentMethod === "qris" || paymentMethod === "transfer_bank";
  const isDisabled =
    isSubmitting ||
    (isShopeeOrder && !shopeeCode?.trim()) ||
    (paymentMethod === "cash" && (cashGiven === 0 || cashGiven === null)) ||
    (isPaymentProofRequired && !paymentProof);
  const buttonText = isDisabled ? "Lengkapi Data Transaksi" : "Selesaikan Transaksi";

  return (
    <IonButton
      expand="block"
      className={`btn-checkout ${
        isDisabled ? "btn-checkout-disabled" : "btn-checkout-ready"
      }`}
      onClick={onCheckout}
      disabled={isDisabled}
    >
      {isSubmitting ? (
        <IonSpinner name="dots" />
      ) : (
        <>
          <IonIcon slot="start" icon={isDisabled ? lockClosed : checkmarkCircle} />
          {buttonText}
        </>
      )}
    </IonButton>
  );
};

export default CheckoutButton;
