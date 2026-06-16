import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  filterBMW: boolean      = true;
  filterAudi: boolean     = true;
  filterMercedes: boolean = true;
  modalOpen: boolean          = false;
  filterDropdownOpen: boolean = false;
  emailValue: string   = '';
  emailInvalid: boolean = false;
listings: CarListing[] = [
  { id: "audi", imgPath: "audi1.png", likes: 12, liked: false, price: 15000, brand: "Audi", model: "A4", mileage: 145000, localization: "Wrocław" },
  { id: "mercedes", imgPath: "mercedes1.png", likes: 15, liked: false, price: 25000, brand: "Mercedes", model: "Benz", mileage: 87000, localization: "Warszawa" },
  { id: "audi", imgPath: "audi2.png", likes: 52, liked: false, price: 35000, brand: "Audi", model: "A3", mileage: 210000, localization: "Podlasie" },
  { id: "mercedes", imgPath: "mercedes2.png", likes: 24, liked: false, price: 15000, brand: "Mercedes", model: "Cabrio", mileage: 63000, localization: "Szczecin" },
  { id: "mercedes", imgPath: "mercedes3.png", likes: 52, liked: false, price: 7000, brand: "Mercedes", model: "Boost", mileage: 178000, localization: "Warszawa" },
  { id: "audi", imgPath: "audi3.png", likes: 122, liked: false, price: 25000, brand: "Audi", model: "M3", mileage: 95000, localization: "Wałbrzych" },
  { id: "bmw", imgPath: "bmw.png", likes: 222, liked: false, price: 35000, brand: "BMW", model: "E34", mileage: 320000, localization: "Warszawa" },
  { id: "bmw", imgPath: "bmw2.png", likes: 4, liked: false, price: 41000, brand: "BMW", model: "E46", mileage: 189000, localization: "Wrocław" },
  { id: "bmw", imgPath: "bmw3.png", likes: 1222, liked: false, price: 135000, brand: "BMW", model: "Quadro", mileage: 42000, localization: "Milicz" },
];
  get filteredListings(): CarListing[] {
    return this.listings.filter(
      ad =>
        (ad.id === "audi"     && this.filterAudi)     ||
        (ad.id === "bmw"      && this.filterBMW)      ||
        (ad.id === "mercedes" && this.filterMercedes)
    );
  }
  get selectedBrandCount(): number {
    return [this.filterBMW, this.filterAudi, this.filterMercedes].filter(Boolean).length;
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
  closeModal(): void           { this.modalOpen = false; }
  toggleFilterDropdown(): void { this.filterDropdownOpen = !this.filterDropdownOpen; }
  closeFilterDropdown(): void  { this.filterDropdownOpen = false; }
  validateEmail(): void {
    const emailRegex = /@/;
    this.emailInvalid = this.emailValue.length > 0 && !emailRegex.test(this.emailValue);
  }
  onEmailInput(): void {
    if (this.emailInvalid) {
      this.validateEmail();
    }
  }
  onLogin(): void {
    const emailRegex = /@/;
    this.emailInvalid = !emailRegex.test(this.emailValue);
    if (!this.emailInvalid) {
      // TODO: obsługa logowania??? Firebase???
      //TO do: Dodac do tablicy więcej lokalizacji
    }
  }
}