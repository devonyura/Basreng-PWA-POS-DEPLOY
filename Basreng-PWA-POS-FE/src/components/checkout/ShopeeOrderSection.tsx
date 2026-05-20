import { IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import React from "react";

interface Props {
  isShopeeOrder: boolean;
  shopeeCode: string | null | undefined;
  setShopeeCode: (shopeeCode: string | null | undefined) => void;
}

const ShopeeOrderSection: React.FC<Props> = ({
  isShopeeOrder,
  shopeeCode,
  setShopeeCode,
}) => {
  if (!isShopeeOrder) {
    return null;
  }

  return (
    <IonItemGroup>
      <IonItemDivider>
        <IonLabel>Nomor Pesanan Shopee *</IonLabel>
      </IonItemDivider>
      <IonItem>
        <IonInput
          name="shopeeCode"
          type="text"
          required
          placeholder="Masukkan No Pesanan, Contoh SPXID025489712345"
          value={shopeeCode}
          onIonChange={(e) => setShopeeCode(e.detail.value)}
        ></IonInput>
      </IonItem>
    </IonItemGroup>
  );
};

export default ShopeeOrderSection;
