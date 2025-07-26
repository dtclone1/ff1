import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title = 'Laptop Store';
  cartItemCount: number = 0;
  searchQuery: string = '';
  isAdmin: boolean = false;

  goToLogin() {
    if (this.isAdmin) {
      localStorage.removeItem('isAdmin');
      this.isAdmin = false;
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
    this.checkAdmin();
    window.addEventListener('storage', () => this.checkAdmin());
    window.addEventListener('admin-login', () => this.checkAdmin());
  }

  checkAdmin() {
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      if (this.router.url.startsWith('/products')) {
        // Lưu giá trị vào localStorage để ProductsComponent lấy và lọc
        localStorage.setItem('products_search', this.searchQuery.trim());
        window.dispatchEvent(new Event('products-search'));
      } else {
        this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      }
    }
    return false;
  }
}