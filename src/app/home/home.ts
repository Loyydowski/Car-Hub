import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type CarCondition = 'new' | 'used';
export type CarFuel = 'Benzyna' | 'Diesel' | 'Elektryczny' | 'Hybryda';
type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'year-desc' | 'mileage-asc';

export type CarListing = {
  id: string;
  imgPath: string;
  likes: number;
  liked: boolean;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: CarFuel;
  localization: string;
  condition: CarCondition;
}

interface BrandFilter {
  name: string;
  selected: boolean;
}

interface ModelFilter {
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
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnDestroy {
  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  private loadingTimer: number | null = null;

  ngOnDestroy(): void {
    if (this.loadingTimer !== null) {
      window.clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
  }

  brands: BrandFilter[] = [
    { name: 'BMW', selected: true },
    { name: 'Audi', selected: true },
    { name: 'Mercedes', selected: true }
  ];

  modelsByBrand: { [brand: string]: ModelFilter[] } = {
    'BMW':      [{ name: 'E34', selected: true }, { name: 'E46', selected: true }, { name: 'Quadro', selected: true }],
    'Audi':     [{ name: 'A4', selected: true }, { name: 'A3', selected: true }, { name: 'M3', selected: true }],
    'Mercedes': [{ name: 'Benz', selected: true }, { name: 'Cabrio', selected: true }, { name: 'Boost', selected: true }],
  };
  modelDropdownOpen: boolean = false;

  get singleSelectedBrand(): string | null {
    const selected = this.stagedBrands.filter(b => b.selected);
    return selected.length === 1 ? selected[0].name : null;
  }

  get availableModels(): ModelFilter[] {
    const brand = this.singleSelectedBrand;
    return brand ? (this.modelsByBrand[brand] ?? []) : [];
  }

  get selectedModelCount(): number {
    return this.availableModels.filter(m => m.selected).length;
  }

  toggleModelDropdown(): void { this.modelDropdownOpen = !this.modelDropdownOpen; }
  closeModelDropdown(): void { this.modelDropdownOpen = false; }
  sortOrder: SortOrder = 'default';

  get sortedListings(): CarListing[] {
    const list = [...this.displayedListings];
    switch (this.sortOrder) {
      case 'price-asc':   return list.sort((a, b) => a.price - b.price);
      case 'price-desc':  return list.sort((a, b) => b.price - a.price);
      case 'year-desc':   return list.sort((a, b) => b.year - a.year);
      case 'mileage-asc': return list.sort((a, b) => a.mileage - b.mileage);
      default:            return list;
    }
  }

  brandSearchTerm: string = '';
  selectedCondition: 'any' | CarCondition = 'any';
  stagedBrands: BrandFilter[] = this.brands.map(b => ({ ...b }));
  stagedCondition: 'any' | CarCondition = 'any';
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
    { id: 'audi-a4',        imgPath: 'audi1.png',     likes: 12,   liked: false, price: 15000,  brand: 'Audi',     model: 'A4',     year: 2011, mileage: 145000, fuel: 'Benzyna',     localization: 'Wrocław',   condition: 'used' },
    { id: 'mercedes-benz',  imgPath: 'mercedes1.png', likes: 15,   liked: false, price: 25000,  brand: 'Mercedes', model: 'Benz',   year: 2015, mileage: 87000,  fuel: 'Diesel',      localization: 'Warszawa',  condition: 'used' },
    { id: 'audi-a3',        imgPath: 'audi2.png',     likes: 52,   liked: false, price: 35000,  brand: 'Audi',     model: 'A3',     year: 2009, mileage: 210000, fuel: 'Benzyna',     localization: 'Podlasie',  condition: 'used' },
    { id: 'mercedes-cabrio',imgPath: 'mercedes2.png', likes: 24,   liked: false, price: 15000,  brand: 'Mercedes', model: 'Cabrio', year: 2020, mileage: 63000,  fuel: 'Hybryda',     localization: 'Szczecin',  condition: 'new'  },
    { id: 'mercedes-boost', imgPath: 'mercedes3.png', likes: 52,   liked: false, price: 7000,   brand: 'Mercedes', model: 'Boost',  year: 2007, mileage: 178000, fuel: 'Diesel',      localization: 'Warszawa',  condition: 'used' },
    { id: 'audi-m3',        imgPath: 'audi3.png',     likes: 122,  liked: false, price: 25000,  brand: 'Audi',     model: 'M3',     year: 2013, mileage: 95000,  fuel: 'Benzyna',     localization: 'Wałbrzych', condition: 'used' },
    { id: 'bmw-e34',        imgPath: 'bmw.png',       likes: 222,  liked: false, price: 35000,  brand: 'BMW',      model: 'E34',    year: 1998, mileage: 320000, fuel: 'Benzyna',     localization: 'Warszawa',  condition: 'used' },
    { id: 'bmw-e46',        imgPath: 'bmw2.png',      likes: 4,    liked: false, price: 41000,  brand: 'BMW',      model: 'E46',    year: 2003, mileage: 189000, fuel: 'Diesel',      localization: 'Wrocław',   condition: 'used' },
    { id: 'bmw-quadro',     imgPath: 'bmw3.png',      likes: 1222, liked: false, price: 135000, brand: 'BMW',      model: 'Quadro', year: 2022, mileage: 42000,  fuel: 'Elektryczny', localization: 'Milicz',    condition: 'new'  },
  ];

  displayedListings: CarListing[] = [...this.listings];
  goToListing(ad: CarListing, index: number): void {
    this.router.navigate(['/ogloszenie', index], {
      state: { listing: ad }
    });
  }

  applyFilters(): void {
    if (this.loadingTimer !== null) {
      window.clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }

    this.isLoading = true;
    this.filterDropdownOpen = false;
    this.modelDropdownOpen = false;
    this.openRangeDropdown = null;

    try {
      const stagedBrandsCopy = this.stagedBrands.map(b => ({ ...b }));
      const singleBrand = stagedBrandsCopy.filter(b => b.selected).length === 1
        ? stagedBrandsCopy.find(b => b.selected)!.name
        : null;
      
      const modelsForBrand = singleBrand ? this.modelsByBrand[singleBrand] : [];
      const selectedModels = singleBrand && modelsForBrand
        ? new Set(modelsForBrand.filter(m => m.selected).map(m => m.name))
        : null;

      const condition = this.stagedCondition;
      const priceFrom = this.stagedPriceFilter.from;
      const priceTo = this.stagedPriceFilter.to;
      const mileageFrom = this.stagedMileageFilter.from;
      const mileageTo = this.stagedMileageFilter.to;

      this.loadingTimer = window.setTimeout(() => {
        try {
          this.appliedBrands = new Set(
            stagedBrandsCopy.filter(b => b.selected).map(b => b.name)
          );
          this.appliedCondition = condition;
          this.appliedPriceFrom = priceFrom;
          this.appliedPriceTo = priceTo;
          this.appliedMileageFrom = mileageFrom;
          this.appliedMileageTo = mileageTo;

          this.displayedListings = this.listings.filter(ad => {
            const brandMatch = this.appliedBrands.has(ad.brand);
            const modelMatch = selectedModels === null ? true : selectedModels.has(ad.model);
            const priceMatch =
              (this.appliedPriceFrom === null || ad.price >= this.appliedPriceFrom) &&
              (this.appliedPriceTo   === null || ad.price <= this.appliedPriceTo);
            const mileageMatch =
              (this.appliedMileageFrom === null || ad.mileage >= this.appliedMileageFrom) &&
              (this.appliedMileageTo   === null || ad.mileage <= this.appliedMileageTo);
            const conditionMatch =
              this.appliedCondition === 'any' || ad.condition === this.appliedCondition;

            return brandMatch && modelMatch && priceMatch && mileageMatch && conditionMatch;
          });
        } catch (e) {
          console.error('Error applying filters inside setTimeout', e);
        } finally {
          this.isLoading = false;
          this.loadingTimer = null;
          this.cdr.detectChanges();
        }
      }, 800);
    } catch (e) {
      console.error('Error preparing filters', e);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  resetFilters(): void {
    this.stagedBrands = this.brands.map(b => ({ ...b, selected: true }));
    this.stagedCondition = 'any';
    this.stagedPriceFilter.from = null;
    this.stagedPriceFilter.to = null;
    this.stagedMileageFilter.from = null;
    this.stagedMileageFilter.to = null;
    Object.values(this.modelsByBrand).forEach(models =>
      models.forEach(m => m.selected = true)
    );
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

  toggleFilterDropdown(): void { this.filterDropdownOpen = !this.filterDropdownOpen; }
  closeFilterDropdown(): void { this.filterDropdownOpen = false; }
}
