import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonLabel,
  IonSegmentButton,
  useIonViewWillEnter,
  useIonViewWillLeave,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";

// State, History etc
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

// hooks
import { useAuth } from "../../hooks/useAuthCookie";

// components
import DetailOrder from "./DetailOrder";
import ProductCard from "../../components/ProductCard";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchSubCategories } from "../../redux/subCategorySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { clearCart } from "../../redux/cartSlice";

// Loading Component
import LoadingScreen from "../../components/LoadingScreen";

// styling
import "./KasirPage.css";

const KasirPage: React.FC = () => {
  // ===== Setup Auth
  const { token, role } = useAuth();
  const history = useHistory();

  // Redirect if token expired/wrong
  useEffect(() => {
    if (token === null && role === null) {
      history.replace("/login", { isTokenExpired: true });
    }
  }, [token, role, history]);

  // get Redux State
  const dispatch = useDispatch<AppDispatch>();
  const {
    products,
    isLoading: productLoading,
    error: productError,
  } = useSelector((state: RootState) => state.products);
  const {
    categories,
    isLoading: categoryLoading,
    error: categoryError,
  } = useSelector((state: RootState) => state.categories);
  const {
    subCategories,
    isLoading: subCategoryLoading,
    error: subCategoryError,
  } = useSelector((state: RootState) => state.subCategories);

  // Jalankan fetchProducts saat pertama kali komponen dimuat
  useIonViewWillEnter(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [dispatch]);

  useIonViewWillLeave(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const refreshKasirData = async () => {
    await Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchCategories()),
      dispatch(fetchSubCategories()),
    ]);
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await refreshKasirData();
    } finally {
      event.detail.complete();
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (productError || categoryError || subCategoryError) {
      setIsNoInternetOpen(true);
    }

    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory("1");
    }
    console.log(isAppLoading);
  }, [productError, categoryError, selectedCategory, categories]);

  // No Internet Connection Alert
  const [isNoInternetOpen, setIsNoInternetOpen] = useState(false);

  // === Loading section
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    if (!productLoading && !categoryLoading && !subCategoryLoading) {
      setIsAppLoading(false);
    }
  }, [productLoading, categoryLoading, subCategoryLoading]);

  if (isAppLoading) {
    return <LoadingScreen />;
  }
  // === Loading section

  return (
    <IonPage>
      <IonAlert
        isOpen={isNoInternetOpen}
        header="Peringatan"
        message="Tidak dapat terhubung ke server. Periksa koneksi Anda."
        buttons={[
          {
            text: "Coba Lagi",
            role: "confirm",
            handler: () => {
              setIsNoInternetOpen(false);
              dispatch(fetchProducts());
            },
          },
        ]}
        onDidDismiss={() => setIsNoInternetOpen(false)}
        backdropDismiss={false}
      ></IonAlert>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kasir Panel</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <h2>Pilih Item yang akan dibeli:</h2>

        <IonSegment
          value={selectedCategory}
          onIonChange={(e) => setSelectedCategory(String(e.detail.value!))}
          class="ion-segment-custom"
          scrollable={true}
        >
          {categories.map((cat) => (
            <IonSegmentButton key={cat.id} value={cat.id}>
              <IonLabel>{cat.name}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>

        <div className="product-grid">
          {products
            .filter(
              (product) => String(product.category_id) === selectedCategory,
            )
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>

        {/* Detail Order Component */}
        <DetailOrder />
      </IonContent>
    </IonPage>
  );
};

export default KasirPage;
