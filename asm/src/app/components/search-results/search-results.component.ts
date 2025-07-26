import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';

interface Laptop {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  specs: {
    cpu: string;
    ram: string;
    storage: string;
    screen: string;
  }
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  laptops: Laptop[] = [];
  filteredLaptops: Laptop[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Lấy query parameter từ URL
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.loadLaptops();
    });
  }

  loadLaptops() {
    this.http.get<{laptops: Laptop[]}>('assets/data/laptops.json')
      .subscribe(data => {
        this.laptops = data.laptops;
        this.filterLaptops();
      });
  }

  filterLaptops() {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredLaptops = this.laptops.filter(laptop => 
      laptop.name.toLowerCase().includes(query) ||
      laptop.brand.toLowerCase().includes(query) ||
      laptop.specs.cpu.toLowerCase().includes(query) ||
      laptop.specs.ram.toLowerCase().includes(query) ||
      laptop.specs.storage.toLowerCase().includes(query)
    );
  }

  addToCart(laptop: Laptop) {
    this.cartService.addToCart(laptop);
  }
}
