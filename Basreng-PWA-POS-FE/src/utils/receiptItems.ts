export interface ReceiptPackageItem {
  category_name?: string | null;
  descriptions?: string | null;
}

export const isPackageItem = (item: ReceiptPackageItem): boolean => {
  return item.category_name?.toLowerCase().includes("paket") ?? false;
};

export const parsePackageDescriptions = (
  descriptions?: string | null,
): string[] => {
  if (!descriptions) {
    return [];
  }

  return descriptions
    .split(",")
    .map((description) => description.trim())
    .filter(Boolean);
};
