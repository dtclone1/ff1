export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  quantity: number;
  specs?: {
    cpu: string;
    ram: string;
    storage: string;
    screen: string;
  }
}