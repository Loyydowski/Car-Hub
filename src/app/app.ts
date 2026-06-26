import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.html',
})
export class App {
  modalOpen: boolean = false;
  emailValue: string = '';
  emailInvalid: boolean = false;

  openModal(): void {
    this.modalOpen = true;
    this.emailValue = '';
    this.emailInvalid = false;
  }

  closeModal(): void { 
    this.modalOpen = false; 
  }

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
      this.closeModal();
    }
  }
}