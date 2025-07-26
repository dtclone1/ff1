import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, DecimalPipe, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  showMessage = false;
  message = '';
  product: any;
  
  loading = true;
  quantity = 1;
  isInWishlist = false;
  userRating = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.http.get<any>('assets/data/laptops.json').subscribe(
        (data) => {
          this.product = data.laptops.find((p: any) => p.id === +productId);
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching product:', error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Khởi tạo tooltips sau khi view đã được render
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  goBack(): void {
    this.location.back();
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart({ ...this.product, quantity: this.quantity });
      this.message = `Đã thêm ${this.quantity} sản phẩm "${this.product.name}" vào giỏ hàng.`;
      this.showToast();
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart({ ...this.product, quantity: this.quantity });
      this.router.navigate(['/checkout']);
    }
  }

  showToast(): void {
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 3000); // Ẩn thông báo sau 3 giây
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    this.message = this.isInWishlist
      ? `Đã thêm "${this.product.name}" vào danh sách yêu thích.`
      : `Đã xóa "${this.product.name}" khỏi danh sách yêu thích.`;
    this.showToast();
  }

  setRating(rating: number): void {
    this.userRating = rating;
    this.message = `Bạn đã đánh giá ${rating} sao cho sản phẩm "${this.product.name}".`;
    this.showToast();
  }

  getStarClass(star: number): string {
    if (this.userRating > 0) {
      return star <= this.userRating ? 'fas fa-star text-warning' : 'far fa-star';
    }
    return star <= this.product.rating ? 'fas fa-star text-warning' : 'far fa-star';
  }
}
