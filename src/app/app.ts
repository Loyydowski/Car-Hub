import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type CarCondition = 'new' | 'used';

type CarListing = {
  id: string;
  imgPath: string;
  likes: number;
  liked: boolean;
  price: number;
  brand: string;
  model: string;
  mileage: number;
  localization: string;
  condition: CarCondition;
}

interface BrandFilter {
  name: string;
  selected: boolean;
}

interface RangeFilter {
  key: string;
  label: string;
  icon: string;
  unit: string;
  placeholderFrom: string;
  placeholderTo: string;
  options: number[];
  from: number | null;
  to: number | null;
}

function generateRangeOptions(step: number, max: number): number[] {
  const result: number[] = [];
  for (let value = step; value <= max; value += step) {
    result.push(value);
  }
  return result;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  brands: BrandFilter[] = [
    { name: 'BMW', selected: true },
    { name: 'Audi', selected: true },
    { name: 'Mercedes', selected: true }
  ];

  brandSearchTerm: string = '';
  selectedCondition: 'any' | CarCondition = 'any';
  stagedBrands: BrandFilter[] = this.brands.map(b => ({ ...b }));
  stagedCondition: 'any' | CarCondition = 'any';
  stagedPriceFrom: number | null = null;
  stagedPriceTo: number | null = null;
  stagedMileageFrom: number | null = null;
  stagedMileageTo: number | null = null;
  appliedBrands: Set<string> = new Set(['BMW', 'Audi', 'Mercedes']);
  appliedCondition: 'any' | CarCondition = 'any';
  appliedPriceFrom: number | null = null;
  appliedPriceTo: number | null = null;
  appliedMileageFrom: number | null = null;
  appliedMileageTo: number | null = null;
  isLoading: boolean = false;
  skeletonCount: number[] = [1, 2, 3];
  get hasPendingChanges(): boolean {
    const brandsChanged = this.stagedBrands.some(b => {
      const applied = this.appliedBrands.has(b.name);
      return b.selected !== applied;
    });

    return (
      brandsChanged ||
      this.stagedCondition !== this.appliedCondition ||
      (this.stagedPriceFilter.from ?? null) !== this.appliedPriceFrom ||
      (this.stagedPriceFilter.to ?? null) !== this.appliedPriceTo ||
      (this.stagedMileageFilter.from ?? null) !== this.appliedMileageFrom ||
      (this.stagedMileageFilter.to ?? null) !== this.appliedMileageTo
    );
  }
  get activeFiltersCount(): number {
    let count = 0;
    const allBrandsSelected = this.appliedBrands.size === this.brands.length;
    if (!allBrandsSelected) count++;
    if (this.appliedCondition !== 'any') count++;
    if (this.appliedPriceFrom !== null || this.appliedPriceTo !== null) count++;
    if (this.appliedMileageFrom !== null || this.appliedMileageTo !== null) count++;
    return count;
  }

  setCondition(condition: 'any' | CarCondition): void {
    this.stagedCondition = condition;
  }

  stagedPriceFilter: RangeFilter = {
    key: 'price',
    label: 'Cena',
    icon: 'bi-cash-coin',
    unit: 'zł',
    placeholderFrom: '0 zł',
    placeholderTo: 'Bez limitu',
    options: generateRangeOptions(20000, 200000),
    from: null,
    to: null
  };

  stagedMileageFilter: RangeFilter = {
    key: 'mileage',
    label: 'Przebieg',
    icon: 'bi-speedometer2',
    unit: 'km',
    placeholderFrom: '0 km',
    placeholderTo: 'Bez limitu',
    options: generateRangeOptions(50000, 350000),
    from: null,
    to: null
  };

  rangeFilters: RangeFilter[] = [this.stagedPriceFilter, this.stagedMileageFilter];

  openRangeDropdown: string | null = null;
  modalOpen: boolean = false;
  filterDropdownOpen: boolean = false;
  emailValue: string = '';
  emailInvalid: boolean = false;

  listings: CarListing[] = [
    { id: "audi",     imgPath: "audi1.png",     likes: 12,   liked: false, price: 15000,  brand: "Audi",     model: "A4",     mileage: 145000, localization: "Wrocław",   condition: 'used' },
    { id: "mercedes", imgPath: "mercedes1.png", likes: 15,   liked: false, price: 25000,  brand: "Mercedes", model: "Benz",   mileage: 87000,  localization: "Warszawa",  condition: 'used' },
    { id: "audi",     imgPath: "audi2.png",     likes: 52,   liked: false, price: 35000,  brand: "Audi",     model: "A3",     mileage: 210000, localization: "Podlasie",  condition: 'used' },
    { id: "mercedes", imgPath: "mercedes2.png", likes: 24,   liked: false, price: 15000,  brand: "Mercedes", model: "Cabrio", mileage: 63000,  localization: "Szczecin",  condition: 'new'  },
    { id: "mercedes", imgPath: "mercedes3.png", likes: 52,   liked: false, price: 7000,   brand: "Mercedes", model: "Boost",  mileage: 178000, localization: "Warszawa",  condition: 'used' },
    { id: "audi",     imgPath: "audi3.png",     likes: 122,  liked: false, price: 25000,  brand: "Audi",     model: "M3",     mileage: 95000,  localization: "Wałbrzych", condition: 'used' },
    { id: "bmw",      imgPath: "bmw.png",       likes: 222,  liked: false, price: 35000,  brand: "BMW",      model: "E34",    mileage: 320000, localization: "Warszawa",  condition: 'used' },
    { id: "bmw",      imgPath: "bmw2.png",      likes: 4,    liked: false, price: 41000,  brand: "BMW",      model: "E46",    mileage: 189000, localization: "Wrocław",   condition: 'used' },
    { id: "bmw",      imgPath: "bmw3.png",      likes: 1222, liked: false, price: 135000, brand: "BMW",      model: "Quadro", mileage: 42000,  localization: "Milicz",    condition: 'new'  },
  ];

  displayedListings: CarListing[] = [...this.listings];
  applyFilters(): void {
    this.isLoading = true;
    this.filterDropdownOpen = false;
    this.openRangeDropdown = null;
    setTimeout(() => {
      this.appliedBrands = new Set(
        this.stagedBrands.filter(b => b.selected).map(b => b.name)
      );
      this.appliedCondition = this.stagedCondition;
      this.appliedPriceFrom = this.stagedPriceFilter.from;
      this.appliedPriceTo = this.stagedPriceFilter.to;
      this.appliedMileageFrom = this.stagedMileageFilter.from;
      this.appliedMileageTo = this.stagedMileageFilter.to;

      this.displayedListings = this.listings.filter(ad => {
        const brandMatch = this.appliedBrands.has(ad.brand);
        const priceMatch =
          (this.appliedPriceFrom === null || ad.price >= this.appliedPriceFrom) &&
          (this.appliedPriceTo   === null || ad.price <= this.appliedPriceTo);
        const mileageMatch =
          (this.appliedMileageFrom === null || ad.mileage >= this.appliedMileageFrom) &&
          (this.appliedMileageTo   === null || ad.mileage <= this.appliedMileageTo);
        const conditionMatch =
          this.appliedCondition === 'any' || ad.condition === this.appliedCondition;

        return brandMatch && priceMatch && mileageMatch && conditionMatch;
      });

      this.isLoading = false;
    }, 800);
  }
  resetFilters(): void {
    this.stagedBrands = this.brands.map(b => ({ ...b, selected: true }));
    this.stagedCondition = 'any';
    this.stagedPriceFilter.from = null;
    this.stagedPriceFilter.to = null;
    this.stagedMileageFilter.from = null;
    this.stagedMileageFilter.to = null;
    this.applyFilters();
  }

  get filteredBrandOptions(): BrandFilter[] {
    const term = this.brandSearchTerm.trim().toLowerCase();
    if (!term) return this.stagedBrands;
    return this.stagedBrands.filter(b => b.name.toLowerCase().startsWith(term));
  }

  get selectedBrandCount(): number {
    return this.stagedBrands.filter(b => b.selected).length;
  }

  private rangeDropdownId(filter: RangeFilter, side: 'from' | 'to'): string {
    return `${filter.key}-${side}`;
  }

  isRangeDropdownOpen(filter: RangeFilter, side: 'from' | 'to'): boolean {
    return this.openRangeDropdown === this.rangeDropdownId(filter, side);
  }

  openRangeField(filter: RangeFilter, side: 'from' | 'to'): void {
    this.openRangeDropdown = this.rangeDropdownId(filter, side);
  }

  toggleRangeDropdown(filter: RangeFilter, side: 'from' | 'to'): void {
    const id = this.rangeDropdownId(filter, side);
    this.openRangeDropdown = this.openRangeDropdown === id ? null : id;
  }

  closeRangeDropdown(): void {
    this.openRangeDropdown = null;
  }

  selectRangeValue(filter: RangeFilter, side: 'from' | 'to', value: number): void {
    if (side === 'from') filter.from = value;
    else filter.to = value;
    this.closeRangeDropdown();
  }

  clearRange(filter: RangeFilter): void {
    filter.from = null;
    filter.to = null;
  }

  hasActiveRange(filter: RangeFilter): boolean {
    return filter.from !== null || filter.to !== null;
  }

  toggleObserwuj(ad: CarListing): void {
    ad.liked = !ad.liked;
    ad.likes += ad.liked ? 1 : -1;
  }

  openModal(): void {
    this.modalOpen = true;
    this.emailValue = '';
    this.emailInvalid = false;
  }

  closeModal(): void { this.modalOpen = false; }
  toggleFilterDropdown(): void { this.filterDropdownOpen = !this.filterDropdownOpen; }
  closeFilterDropdown(): void { this.filterDropdownOpen = false; }

  validateEmail(): void {
    const emailRegex = /@/;
    this.emailInvalid = this.emailValue.length > 0 && !emailRegex.test(this.emailValue);
  }

  onEmailInput(): void {
    if (this.emailInvalid) this.validateEmail();
  }

  onLogin(): void {
    const emailRegex = /@/;
    this.emailInvalid = !emailRegex.test(this.emailValue);
  }
}