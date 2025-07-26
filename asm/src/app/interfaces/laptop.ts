export interface Laptop {
    id: number;
    name: string;
    price: number;
    image: string;
    brand: string;
    category?: string;
    originalPrice?: number;
    discountPercent?: number;
    soldCount?: number;
    soldPercent?: number;
    specs: {
        cpu: string;
        ram: string;
        storage: string;
        screen: string;
    }
}
