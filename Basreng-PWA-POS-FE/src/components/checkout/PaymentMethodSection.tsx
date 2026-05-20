import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonItem,
  IonRow,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import React from "react";

interface Props {
  paymentMethod: string;
  setPaymentMethod: (e: string) => void;
  isCash: boolean;
  setIsCash: (e: boolean) => void;
  isShopeeOrder: boolean;
}

const PaymentMethodSection: React.FC<Props> = ({
  paymentMethod,
  setPaymentMethod,
  isShopeeOrder,
  isCash,
  setIsCash,
}) => {
  const showPaymentInstruction =
    paymentMethod === "qris" || paymentMethod === "transfer_bank";

  return (
    <>
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol size={showPaymentInstruction ? "9" : "12"} hidden={isShopeeOrder}>
              <IonSelect
                name="payment_method"
                label="Pembayaran:"
                value={paymentMethod}
                onIonChange={(e) => setPaymentMethod(e.detail.value)}
              >
                <IonSelectOption value="cash">Cash</IonSelectOption>
                <IonSelectOption value="qris">QRIS</IonSelectOption>
                <IonSelectOption value="transfer_bank">
                  TRANSFER BANK
                </IonSelectOption>
              </IonSelect>
            </IonCol>
            {showPaymentInstruction && (
              <IonCol className="flex-center qr-method">
                <IonButton id="open-payment-method" expand="full">
                  {paymentMethod === "qris" ? "QR" : "TF"}
                </IonButton>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonItem>
      <IonItem disabled={isShopeeOrder}>
        <IonCheckbox
          checked={isCash}
          onIonChange={(e) => setIsCash(e.detail.checked)}
        >
          Uang Pas
        </IonCheckbox>
      </IonItem>
    </>
  );
};

export default PaymentMethodSection;
