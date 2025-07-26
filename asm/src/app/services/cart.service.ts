import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../interfaces/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  addToCart(product: any) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1
      });
    }
    
    this.cartSubject.next([...this.items]);
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  removeFromCart(itemId: number) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.cartSubject.next([...this.items]);
  }

  updateQuantity(itemId: number, change: number) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        item.quantity = newQuantity;
      } else {
        this.removeFromCart(itemId);
      }
      this.cartSubject.next([...this.items]);
    }
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next([]);
  }
}
