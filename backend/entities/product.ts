export interface Product {
  id: number;
  name: string;
  version: string;
  description: string;
  price: number;
  imagePath?: string; // Optional to maintain backward compatibility
}
