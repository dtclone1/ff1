import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Laptop } from '../../interfaces/laptop';
import { Category } from '../../interfaces/category';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, OnDestroy, AfterViewInit {
  // Sản phẩm
  laptops: Laptop[] = [];
  filteredLaptops: Laptop[] = [];
  paginatedLaptops: Laptop[] = [];

  // Bộ lọc
  brands: string[] = [];
  categories: Category[] = [];
  selectedBrands: string[] = [];
  selectedCategories: string[] = [];
  localSearchQuery: string = '';
  priceRange = { min: 0, max: 0 };
  maxPrice: number = 0;
  sortOption: string = 'default';
  isFiltered: boolean = false;

  // Phân trang
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  // Toast notification
  showToast: boolean = false;
  toastMessage: string = '';
  toastTimeout: any;

  // Wishlist
  wishlist: number[] = [];

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadWishlistFromStorage();

    // Lấy query params từ URL
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategories = [params['category']];
      }
      if (params['brand']) {
        this.selectedBrands = [params['brand']];
      }
      if (params['search']) {
        this.localSearchQuery = params['search'];
      }
      if (params['page']) {
        this.currentPage = +params['page'];
      }
    });
  }

  ngOnDestroy() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadProducts() {
    this.http.get<{ laptops: Laptop[] }>('assets/data/laptops.json')
      .subscribe({
        next: (data) => {
          this.laptops = data.laptops.map(laptop => {
            // Thêm thông tin cho một số sản phẩm (giảm giá)
            if (laptop.id % 3 === 0) {
              const discountPercent = Math.floor(Math.random() * 30) + 10; // 10-40%
              const originalPrice = Math.round((laptop.price * 100) / (100 - discountPercent));
              return { ...laptop, originalPrice };
            }
            return laptop;
          });

          // Lấy danh sách thương hiệu
          this.brands = [...new Set(this.laptops.map(laptop => laptop.brand))];

          // Tìm giá cao nhất
          this.maxPrice = Math.max(...this.laptops.map(laptop => laptop.price));
          this.priceRange = { min: 0, max: this.maxPrice };

          // Áp dụng bộ lọc ban đầu
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading products:', error);
        }
      });
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

  private loadWishlistFromStorage(): void {
    // Kiểm tra xem có đang chạy trong trình duyệt không
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

  private saveWishlistToStorage(): void {
    // Kiểm tra xem có đang chạy trong trình duyệt không
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index === -1) {
      this.selectedBrands.push(brand);
    } else {
      this.selectedBrands.splice(index, 1);
    }
    this.applyFilters();
  }

  toggleCategory(categoryId: string) {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index === -1) {
      this.selectedCategories.push(categoryId);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.applyFilters();
  }

  onLocalSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPriceChange() {
    // Đảm bảo min <= max
    if (this.priceRange.min > this.priceRange.max) {
      this.priceRange.max = this.priceRange.min;
    }
    this.applyFilters();
  }

  onSortChange() {
    this.sortProducts();
    this.updatePagination();
  }

  applyFilters() {
    let result = [...this.laptops];

    // Lọc theo thương hiệu
    if (this.selectedBrands.length > 0) {
      result = result.filter(laptop => this.selectedBrands.includes(laptop.brand));
    }

    // Lọc theo danh mục
    if (this.selectedCategories.length > 0) {
      result = result.filter(laptop => {
        const category = this.assignCategory(laptop);
        return this.selectedCategories.includes(category);
      });
    }

    // Lọc theo khoảng giá
    result = result.filter(laptop =>
      laptop.price >= this.priceRange.min &&
      laptop.price <= this.priceRange.max
    );

    // Lọc theo từ khóa tìm kiếm
    if (this.localSearchQuery.trim()) {
      const query = this.localSearchQuery.toLowerCase().trim();
      result = result.filter(laptop =>
        laptop.name.toLowerCase().includes(query) ||
        laptop.brand.toLowerCase().includes(query) ||
        laptop.specs.cpu.toLowerCase().includes(query) ||
        laptop.specs.ram.toLowerCase().includes(query) ||
        laptop.specs.storage.toLowerCase().includes(query)
      );
    }

    // Kiểm tra xem có bộ lọc nào được áp dụng không
    this.isFiltered = this.selectedBrands.length > 0 ||
      this.selectedCategories.length > 0 ||
      this.localSearchQuery.trim() !== '' ||
      this.priceRange.min > 0 ||
      this.priceRange.max < this.maxPrice;

    this.filteredLaptops = result;

    // Sắp xếp sản phẩm
    this.sortProducts();

    // Reset về trang đầu tiên khi thay đổi bộ lọc
    this.currentPage = 1;

    // Cập nhật phân trang
    this.updatePagination();

    // Cập nhật URL với các tham số lọc
    this.updateUrlParams();
  }

  sortProducts() {
    switch (this.sortOption) {
      case 'price-asc':
        this.filteredLaptops.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredLaptops.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredLaptops.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredLaptops.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Mặc định sắp xếp theo ID
        this.filteredLaptops.sort((a, b) => a.id - b.id);
        break;
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLaptops.length / this.itemsPerPage);

    // Đảm bảo currentPage hợp lệ
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    // Lấy sản phẩm cho trang hiện tại
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedLaptops = this.filteredLaptops.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number | string) {
    // Chuyển đổi page sang kiểu number nếu nó là string
    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;

    if (pageNumber >= 1 && pageNumber <= this.totalPages && pageNumber !== this.currentPage) {
      this.currentPage = pageNumber;
      this.updatePagination();
      this.updateUrlParams();

      // Cuộn lên đầu danh sách sản phẩm
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalVisiblePages = 5;

    if (this.totalPages <= totalVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang <= totalVisiblePages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pages.push(1);

      // Tính toán phạm vi trang hiển thị
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

      // Điều chỉnh phạm vi nếu cần
      if (startPage > 2) {
        pages.push('...');
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu ... nếu cần
      if (endPage < this.totalPages - 1) {
        pages.push('...');
      }

      // Luôn hiển thị trang cuối cùng
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  updateUrlParams() {
    const queryParams: any = {};

    if (this.selectedCategories.length === 1) {
      queryParams.category = this.selectedCategories[0];
    }

    if (this.selectedBrands.length === 1) {
      queryParams.brand = this.selectedBrands[0];
    }

    if (this.localSearchQuery) {
      queryParams.search = this.localSearchQuery;
    }

    if (this.currentPage > 1) {
      queryParams.page = this.currentPage;
    }

    // Cập nhật URL mà không reload trang
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  resetFilters() {
    this.selectedBrands = [];
    this.selectedCategories = [];
    this.localSearchQuery = '';
    this.priceRange = { min: 0, max: this.maxPrice };
    this.sortOption = 'default';
    this.currentPage = 1;
    this.applyFilters();
  }

  addToCart(laptop: Laptop) {
    this.cartService.addToCart(laptop);
    this.showToastMessage(`Đã thêm ${laptop.name} vào giỏ hàng`);
  }

  toggleWishlist(laptop: Laptop) {
    const index = this.wishlist.indexOf(laptop.id);
    if (index === -1) {
      // Thêm vào wishlist
      this.wishlist.push(laptop.id);
      this.showToastMessage(`Đã thêm ${laptop.name} vào danh sách yêu thích`);
    } else {
      // Xóa khỏi wishlist
      this.wishlist.splice(index, 1);
      this.showToastMessage(`Đã xóa ${laptop.name} khỏi danh sách yêu thích`);
    }

    // Lưu vào localStorage
    this.saveWishlistToStorage();
  }

  isInWishlist(laptopId: number): boolean {
    return this.wishlist.includes(laptopId);
  }

  isNewProduct(laptop: Laptop): boolean {
    // Giả sử sản phẩm có id > 7 là sản phẩm mới
    return laptop.id > 7;
  }

  calculateDiscount(currentPrice: number, originalPrice: number): number {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  assignCategory(laptop: Laptop): string {
    // Phân loại laptop dựa trên thông số kỹ thuật
    if (laptop.price > 1500 || laptop.brand === 'Apple') {
      return 'premium';
    } else if (laptop.specs.cpu.includes('Ryzen') || laptop.specs.cpu.includes('i7') || laptop.specs.cpu.includes('i9')) {
      return 'gaming';
    } else if (laptop.price < 800) {
      return 'student';
    } else {
      return 'business';
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

  ngAfterViewInit() {
    // Khởi tạo các thành phần Bootstrap
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      setTimeout(() => {
        try {
          // Khởi tạo tooltips nếu có
          if (typeof (window as any).bootstrap !== 'undefined') {
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            Array.from(tooltipTriggerList).forEach(tooltipTriggerEl =>
              new (window as any).bootstrap.Tooltip(tooltipTriggerEl)
            );

            // Khởi tạo toasts
            const toastElList = document.querySelectorAll('.toast');
            Array.from(toastElList).forEach(toastEl =>
              new (window as any).bootstrap.Toast(toastEl)
            );
          }
        } catch (error) {
          console.error('Error initializing Bootstrap components:', error);
        }
      }, 100);
    }
  }
}