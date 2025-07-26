import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Laptop } from '../../interfaces/laptop';
import { Category } from '../../interfaces/category';
import { Testimonial } from '../../interfaces/testimonial';
import { Brand } from '../../interfaces/brand';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  laptops: Laptop[] = [];
  featuredLaptops: Laptop[] = [];
  filteredLaptops: Laptop[] = [];

  categories: Category[] = [];

  testimonials: Testimonial[] = [];

  brands: Brand[] = [];

  countdownDays: number = 1;
  countdownHours: number = 12;
  countdownMinutes: number = 30;
  countdownSeconds: number = 0;
  countdownInterval: any;

  showToast: boolean = false;
  toastMessage: string = '';
  toastTimeout: any;

  newsletterEmail: string = '';

  wishlist: number[] = [];

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadTestimonials();
    this.loadBrands();
    this.startCountdown();

    this.loadWishlistFromStorage();
  }

  private loadWishlistFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          this.wishlist = JSON.parse(savedWishlist);
        }
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadProducts() {
    this.http.get<{ laptops: Laptop[] }>('assets/data/laptops.json')
      .subscribe(data => {
        this.laptops = data.laptops;

        this.featuredLaptops = this.laptops.map(laptop => {
          const discountPercent = Math.floor(Math.random() * 30) + 10; // 10-40%
          const originalPrice = Math.round((laptop.price * 100) / (100 - discountPercent));
          const soldCount = Math.floor(Math.random() * 50) + 10; // 10-60
          const soldPercent = Math.floor((soldCount / 100) * 100); // 0-100%

          return {
            ...laptop,
            originalPrice,
            discountPercent,
            soldCount,
            soldPercent,
            category: this.assignCategory(laptop)
          };
        });

        this.featuredLaptops.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));

        this.filteredLaptops = [...this.laptops];
      });
  }

  assignCategory(laptop: Laptop): string {
    if (laptop.price > 1500 || laptop.brand === 'Apple') {
      return 'premium';
    } else if (laptop.specs.cpu.includes('Ryzen') || laptop.specs.cpu.includes('i7') || laptop.specs.cpu.includes('i9')) {
      return 'gaming';
    } else {
      return 'business';
    }
  }

  addToCart(laptop: Laptop) {
    this.cartService.addToCart(laptop);
    this.showToastMessage(`Đã thêm ${laptop.name} vào giỏ hàng`);
  }

  filterProducts(category: string) {
    document.querySelectorAll('.section-tabs .tab-btn').forEach((btn, index) => {
      btn.classList.remove('active');
      if ((category === 'all' && index === 0) ||
        ((btn as HTMLElement).textContent?.trim().toLowerCase().includes(category.toLowerCase()))) {
        btn.classList.add('active');
      }
    });

    if (category === 'all') {
      this.filteredLaptops = [...this.laptops];
    } else {
      this.filteredLaptops = this.laptops.filter(laptop =>
        this.assignCategory(laptop) === category
      );
    }
  }

  toggleWishlist(laptop: Laptop) {
    const index = this.wishlist.indexOf(laptop.id);
    if (index === -1) {
      this.wishlist.push(laptop.id);
      this.showToastMessage(`Đã thêm ${laptop.name} vào danh sách yêu thích`);
    } else {
      this.wishlist.splice(index, 1);
      this.showToastMessage(`Đã xóa ${laptop.name} khỏi danh sách yêu thích`);
    }

    this.saveWishlistToStorage();
  }

  private saveWishlistToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }

  isInWishlist(laptopId: number): boolean {
    return this.wishlist.includes(laptopId);
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      if (this.countdownSeconds > 0) {
        this.countdownSeconds--;
      } else {
        this.countdownSeconds = 59;

        if (this.countdownMinutes > 0) {
          this.countdownMinutes--;
        } else {
          this.countdownMinutes = 59;

          if (this.countdownHours > 0) {
            this.countdownHours--;
          } else {
            this.countdownHours = 23;

            if (this.countdownDays > 0) {
              this.countdownDays--;
            } else {
              clearInterval(this.countdownInterval);
            }
          }
        }
      }
    }, 1000);
  }

  scrollToProducts() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        const element = document.getElementById('featuredProducts');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({
            top: 800,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }

  subscribeNewsletter() {
    if (typeof window !== 'undefined' && this.newsletterEmail) {
      this.showToastMessage(`Cảm ơn bạn đã đăng ký nhận tin với email: ${this.newsletterEmail}`);
      this.newsletterEmail = '';
    }
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.showToast = false;
  }

  loadCategories() {
    this.http.get<{ categories: Category[] }>('assets/data/categories.json')
      .subscribe({
        next: (data) => {
          this.categories = data.categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  loadTestimonials() {
    this.http.get<{ testimonials: Testimonial[] }>('assets/data/testimonials.json')
      .subscribe({
        next: (data) => {
          this.testimonials = data.testimonials;
        },
        error: (error) => {
          console.error('Error loading testimonials:', error);
        }
      });
  }

  loadBrands() {
    this.http.get<{ brands: Brand[] }>('assets/data/brands.json')
      .subscribe({
        next: (data) => {
          this.brands = data.brands;
        },
        error: (error) => {
          console.error('Error loading brands:', error);
        }
      });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        try {
          const carouselElement = document.getElementById('mainBanner');
          if (carouselElement && typeof (window as any).bootstrap !== 'undefined') {
            new (window as any).bootstrap.Carousel(carouselElement, {
              interval: 5000,
              wrap: true
            });
          }
        } catch (error) {
          console.error('Error initializing Bootstrap components:', error);
        }
      }, 100);
    }
  }
}
