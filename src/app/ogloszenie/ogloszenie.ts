import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarListing } from '../home/home';

@Component({
  selector: 'app-ogloszenie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ogloszenie.html',
  styleUrl: './ogloszenie.scss',
})
export class Ogloszenie implements OnInit {
  listing: CarListing | null = null;

  images: string[] = [];
  mainImageIndex: number = 0;
  isPhoneVisible: boolean = false;
  isDescriptionExpanded: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const navState = nav?.extras?.state as { listing: CarListing } | undefined;

    if (navState?.listing) {
      this.initListing(navState.listing);
      return;
    }

    const historyState = history.state as { listing?: CarListing };
    if (historyState?.listing) {
      this.initListing(historyState.listing);
    }
  }

  private initListing(listing: CarListing) {
    this.listing = listing;
    this.images = [
      'assets/' + listing.imgPath,
      'https://placehold.co/800x500/1a1d24/333845?text=Zdj%C4%99cie+2',
      'https://placehold.co/800x500/1a1d24/333845?text=Zdj%C4%99cie+3',
      'https://placehold.co/800x500/1a1d24/333845?text=Zdj%C4%99cie+4'
    ];
  }

  get mainImage(): string {
    return this.images[this.mainImageIndex] || '';
  }

  nextImage(): void {
    if (this.images.length > 0) {
      this.mainImageIndex = (this.mainImageIndex + 1) % this.images.length;
    }
  }

  prevImage(): void {
    if (this.images.length > 0) {
      this.mainImageIndex = (this.mainImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  setMainImage(index: number): void {
    this.mainImageIndex = index;
  }

  togglePhone(): void {
    this.isPhoneVisible = true;
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  toggleLike(): void {
    if (this.listing) {
      this.listing.liked = !this.listing.liked;
      this.listing.likes += this.listing.liked ? 1 : -1;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
