import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from './pos-main.service';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pos-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-main.html',
  styleUrl: './pos-main.css'
})
export class PosMain implements OnInit {
  private posService = inject(PosService);
  private router = inject(Router);

  tableGroups = signal<any[]>([]);
  selectedGroup = signal<any>(null);
  fullName = signal<string>('');
  terminalNumber = signal<string>('');

  currentDate = signal(new Date());
  isOnline = signal(navigator.onLine);
  showNetworkAlert = signal(false);
  private timer: any;
  private networkSub?: Subscription;

  ngOnInit() {
    this.fetchInitialData();
    this.loadUserInfo();

    this.timer = setInterval(() => {
      this.currentDate.set(new Date());
    }, 1000);

    this.networkSub = merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe((status) => {
      this.isOnline.set(status);

      this.showNetworkAlert.set(true);

      if (status) {
        setTimeout(() => this.showNetworkAlert.set(false), 3000);
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.networkSub?.unsubscribe();
    }
  }

  closeAlert() {
    this.showNetworkAlert.set(false);
  }

  loadUserInfo() {
    this.fullName.set(localStorage.getItem('fullName') || 'Unknown User');
    this.terminalNumber.set(localStorage.getItem('terminalNumber') || '000');
  }

  fetchInitialData() {
    this.posService.getTableGroupsWithTables().subscribe({
      next: (data) => {
        this.tableGroups.set(data);
        if (data.length > 0) {
          this.selectedGroup.set(data[0]);
        }
      },
      error: (err) => console.error('Failed to load data:', err)
    });
  }

  onGroupClick(id: number) {
    this.posService.getTablesByGroup(id).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.selectedGroup.set(res[0]);
        }
      },
      error: (err) => console.error('Failed to load tables:', err)
    });
  }

  onTableClick(table: any) {
    const idToUse = table.tableId;

    if (table.status === 'Vacant') {
      this.createOrderFlow(idToUse);
    } else {
      this.posService.getActiveOrderByTable(idToUse).subscribe({
        next: (res) => {
          this.router.navigate(['/pos-order', res.orderId]);
        },
        error: (err) => {
          if (err.status === 404) {
            this.createOrderFlow(idToUse);
          } else {
            console.error('Other Error:', err);
          }
        }
      });
    }
  }

  createOrderFlow(tableId: number) {
    this.posService.createNewOrder(tableId).subscribe({
      next: (res) => {
        this.router.navigate(['/pos-order', res.order.orderId]);
      },
      error: (err) => console.error('Failed to create order:', err)
    });
  }

  onLogout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}