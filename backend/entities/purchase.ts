export interface PurchaseItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Purchase {
  id: number;
  userId: number;
  items: PurchaseItem[];
  totalAmount: number;
  purchaseDate: string;
}
