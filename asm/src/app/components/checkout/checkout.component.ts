import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../interfaces/cart-item';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  customer = {
    name: '',
    phone: '',
    address: '',
    email: ''
  };
  orderSuccess = false;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });
  }

  onSubmit() {
    if (
      this.cartItems.length === 0 ||
      !this.customer.name.trim() ||
      !this.customer.phone.trim() ||
      !this.customer.address.trim() ||
      !this.customer.email.trim()
    ) {
      return;
    }
    this.orderSuccess = true;
    this.cartService.clearCart();
  }
}
