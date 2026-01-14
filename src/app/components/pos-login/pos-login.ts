import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Kinahanglan ni para sa [(ngModel)]

@Component({
  selector: 'app-pos-login',
  standalone: true,
  imports: [FormsModule], // I-import ang FormsModule diri
  templateUrl: './pos-login.html',
})
export class PosLogin {
  private router = inject(Router);

  // Form Fields
  username = '';
  password = '';
  errorMessage = ''; // Variable para sa error text
  isPasswordVisible = false;

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    // Simple Validation Logic
    if (this.username === 'admin' && this.password === '1234') {
      this.errorMessage = ''; // Clear error
      localStorage.setItem('token', 'active_session');
      this.router.navigate(['/pos']);
    } else {
      // Kon sayop, ipakita ang error
      this.errorMessage = 'Invalid username or password. Please try again.';

      // I-clear ang password field para maka-type usab
      this.password = '';
    }
  }
}