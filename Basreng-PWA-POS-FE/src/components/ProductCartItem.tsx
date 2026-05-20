import React from "react";
import { IonButton, IonIcon } from "@ionic/react";

import { add, remove, trashBin } from "ionicons/icons";

import { rupiahFormat, formatProductName } from "../hooks/formatting";
import { FILE_BASE_URL } from "../hooks/restAPIRequest";

import { useDispatch } from "react-redux";
import { updateQty, removeFromCart, CartItem } from "../redux/cartSlice";
import { isPackageItem, parsePackageDescriptions } from "../utils/receiptItems";
import "./ProductCartItem.css";

interface ProductCartItemProps {
  item: CartItem;
}

const ProductCartItem: React.FC<ProductCartItemProps> = ({ item }) => {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(
      updateQty({
        variant_id: item.variant_id,
        quantity: item.quantity + 1,
      }),
    );
  };

  const handleRemove = () => {
    dispatch(
      updateQty({
        variant_id: item.variant_id,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleReset = () => {
    dispatch(removeFromCart(item.variant_id));
  };

  const imageSrc = item.img ? `${FILE_BASE_URL}/${item.img}` : "/icon.png";
  const packageDescriptions = isPackageItem(item)
    ? parsePackageDescriptions(item.descriptions)
    : [];

  return (
    <div className="cart-item-card">
      <img
        className="cart-item-image"
        src={imageSrc}
        alt={item.name}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = "/icon.png";
        }}
      />

      <div className="cart-item-main">
        <div className="cart-item-top">
          <div className="cart-item-text">
            <b className="cart-item-title">
              {formatProductName(item.name, item.weight_grams)}
            </b>
            <span className="cart-item-price">{rupiahFormat(item.price)}</span>
          </div>

          <IonButton
            className="cart-item-trash"
            fill="clear"
            color="danger"
            size="small"
            aria-label="Hapus item"
            onClick={handleReset}
          >
            <IonIcon slot="icon-only" icon={trashBin}></IonIcon>
          </IonButton>
        </div>

        {packageDescriptions.length > 0 && (
          <div className="cart-item-package">
            <span>Isi paket:</span>
            <ul>
              {packageDescriptions.map((description, index) => (
                <li key={`${item.variant_id}-package-${index}`}>
                  {description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="cart-item-bottom">
          <div className="cart-item-qty">
            <IonButton fill="clear" size="small" onClick={handleRemove}>
              <IonIcon slot="icon-only" icon={remove}></IonIcon>
            </IonButton>
            <span>{item.quantity}</span>
            <IonButton fill="clear" size="small" onClick={handleAdd}>
              <IonIcon slot="icon-only" icon={add}></IonIcon>
            </IonButton>
          </div>

          <strong className="cart-item-subtotal">
            {rupiahFormat(item.subtotal)}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCartItem);
