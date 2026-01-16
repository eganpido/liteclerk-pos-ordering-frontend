import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core'; // Gidugangan og OnInit
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '../../constants/config';

@Component({
  selector: 'app-pos-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pos-login.html',
  styleUrl: './pos-login.css'
})
export class PosLogin implements OnInit { // Gidugangan og implements OnInit
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  username = '';
  password = '';
  errorMessage = '';
  isPasswordVisible = false;
  isLoading = false;

  terminals: any[] = [];
  selectedTerminalId: string = '';

  appVersion = APP_CONFIG.version;

  ngOnInit() {
    this.getTerminals();
  }

  getTerminals() {
    // Usba ang URL base sa imong tinuod nga endpoint para sa terminals
    this.http.get<any[]>(`${APP_CONFIG.apiUrl}/terminals`).subscribe({
      next: (data) => {
        this.terminals = data;
        if (this.terminals.length > 0) {
          this.selectedTerminalId = this.terminals[0].terminalId;
        }
      },
      error: (err) => {
        console.error('Error fetching terminals', err);
      }
    });
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.username || !this.password || !this.selectedTerminalId) {
      this.errorMessage = 'Please enter credentials.';
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    const selectedTerminal = this.terminals.find(t => t.terminalId == this.selectedTerminalId);

    const url = `${APP_CONFIG.apiUrl}/auth/login`;

    const payload = {
      username: this.username,
      password: this.password,
      terminalId: Number(this.selectedTerminalId),
      terminalNumber: selectedTerminal?.terminalNumber || ''
    };

    setTimeout(() => {
      this.http.post(url, payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;

          localStorage.setItem('token', response.access_token);
          localStorage.setItem('userId', response.user.userId);
          localStorage.setItem('username', response.user.username);
          localStorage.setItem('fullName', response.user.fullName);
          localStorage.setItem('terminalId', response.user.terminalId);
          localStorage.setItem('terminalNumber', response.user.terminalNumber);

          this.router.navigate(['/pos']);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid username or password!';
          this.cdr.detectChanges();
        }
      });
    }, 1000);
  }
}