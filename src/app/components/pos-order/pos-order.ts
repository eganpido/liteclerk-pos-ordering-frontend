import { Component, OnInit, inject, signal, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosOrderService } from '../pos-order/pos-order.service';
import { Router } from '@angular/router';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-pos-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-order.html',
  styleUrl: './pos-order.css',
})
export class PosOrder implements OnInit {
  private posOrderService = inject(PosOrderService);
  private router = inject(Router);

  orderId = input.required<number>();
  orderNumber = signal<string>('');
  orderDate = signal<string>('');
  tableCode = signal<string>('');
  itemGroups = signal<any[]>([]);
  selectedGroupId = signal<number | null>(null);
  filteredItems = signal<any[]>([]);
  currentOrderItems = signal<any[]>([]);
  fullName = signal<string>('');
  terminalNumber = signal<string>('');
  isOrderOpen = signal(false);
  isClosing = signal(false);

  showConfirmModal = signal(false);
  itemToDelete = signal<any>(null);
  showClearAllModal = signal(false);
  searchQuery = signal<string>('');
  allGroupItems = signal<any[]>([]);

  ngOnInit() {
    this.loadUserInfo();
    this.loadItemGroups();
    this.loadOrderDetails();
  }

  loadUserInfo() {
    this.fullName.set(localStorage.getItem('fullName') || 'Unknown User');
    this.terminalNumber.set(localStorage.getItem('terminalNumber') || '000');
  }

  loadItemGroups() {
    this.posOrderService.getItemGroups().subscribe({
      next: (data: any[]) => {
        // TAN-AWA NI PAG-AYO SA CONSOLE
        console.log('First Item in Groups:', data[0]);

        // I-check kung unsa ang saktong ngalan sa field para sa '79'
        // Basin 'posItemGroupId' o 'id' o 'posId'?

        this.itemGroups.set(data);
      }
    });
  }

  loadOrderDetails() {
    const id = this.orderId();
    if (!id) return;

    this.posOrderService.getOrderItems(id).subscribe({
      next: (items: any) => this.currentOrderItems.set(items || []),
      error: (err) => console.error('Error items:', err)
    });

    this.posOrderService.getOrderById(id).pipe(
      switchMap((res: any) => {
        const orderData = res?.order || res;

        if (orderData && orderData.orderNumber) {
          this.orderNumber.set(orderData.orderNumber);
          this.orderDate.set(orderData.orderDate);
          return this.posOrderService.getTableById(orderData.tableId);
        } else {
          console.warn('Order details not found in response:', res);
          return of(null);
        }
      })
    ).subscribe({
      next: (tableRes: any) => {
        if (tableRes?.tableCode) this.tableCode.set(tableRes.tableCode);
      },
      error: (err) => console.error('Error in Order/Table Chain:', err)
    });
  }

  displayItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const items = this.allGroupItems();

    if (!query) return items;

    return items.filter(item =>
      item.itemDescription.toLowerCase().includes(query) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(query))
    );
  });

  onGroupSelect(received: any) {
    let idToUse: number;

    if (typeof received === 'object') {
      idToUse = received.posItemGroupId;
    } else {
      // Kung '1' ra gyud ang niabot, pangitaon nato ang 79 sa itemGroups list
      const foundGroup = this.itemGroups().find(g => g.itemGroupId === received);
      idToUse = foundGroup ? foundGroup.posItemGroupId : received;
    }

    console.log('Final Sync ID:', idToUse); // Dapat 79 na jud ni mogawas

    this.selectedGroupId.set(idToUse);
    this.posOrderService.getItemsByGroup(idToUse).subscribe({
      next: (data) => this.allGroupItems.set(data)
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  addToOrder(item: any) {
    this.updateQuantityLogic(item, 1);
  }

  increaseQuantity(item: any) {
    this.updateQuantityLogic(item, 1);
  }

  decreaseQuantity(item: any) {
    if (item.quantity <= 1) {
      this.itemToDelete.set(item);
      this.showConfirmModal.set(true);
    } else {
      this.updateQuantityLogic(item, -1);
    }
  }

  private updateQuantityLogic(item: any, change: number) {
    const payload = {
      orderId: this.orderId(),
      itemId: item.itemId,
      itemDescription: item.itemDescription,
      price: item.price,
      quantity: change
    };

    this.posOrderService.saveOrderItem(payload).subscribe({
      next: () => this.loadOrderDetails(),
      error: (err) => console.error('Error updating quantity:', err)
    });
  }

  openDeleteConfirm(item: any) {
    this.itemToDelete.set(item);
    this.showConfirmModal.set(true);
  }

  confirmDelete() {
    const item = this.itemToDelete();
    if (item) {
      this.posOrderService.removeOrderItem(item.orderItemId).subscribe({
        next: () => {
          this.loadOrderDetails();
          this.closeModal();
        },
        error: (err) => console.error('Error deleting item:', err)
      });
    }
  }

  closeModal() {
    this.showConfirmModal.set(false);
    this.itemToDelete.set(null);
  }

  calculateSubtotal(): number {
    return this.currentOrderItems().reduce((acc, item) => acc + item.subtotal, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.12;
  }

  calculateTotal(): number {
    return this.calculateSubtotal()
    // return this.calculateSubtotal() + this.calculateTax();
  }

  goBack() {
    this.router.navigate(['/pos']);
  }

  toggleOrder() {
    this.isOrderOpen.set(!this.isOrderOpen());
  }

  closeOrder() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.isOrderOpen.set(false);
      this.isClosing.set(false);
    }, 400);
  }

  getGroupCategory(groupName: string): string {
    const name = groupName.toLowerCase();
    if (name.includes('rice')) return 'rice';
    if (name.includes('drink') || name.includes('beverage')) return 'drinks';
    if (name.includes('appetizer') || name.includes('starter') || name.includes('dessert')) return 'appetizer';
    if (name.includes('main') || name.includes('dish')) return 'main';
    if (name.includes('liquor') || name.includes('alcohol')) return 'alcohol';
    return 'default';
  }

  openClearAllConfirm() {
    if (this.currentOrderItems().length === 0) return;
    this.showClearAllModal.set(true);
  }
  confirmClearAll() {
    const id = this.orderId();

    this.posOrderService.removeOrderItems(id).subscribe({
      next: () => {
        this.loadOrderDetails();
        this.closeClearAllModal();
        console.log('Order items cleared successfully');
      },
      error: (err: any) => {
        console.error('Error clearing order:', err);
        alert('Failed to clear order items.');
      }
    });
  }

  closeClearAllModal() {
    this.showClearAllModal.set(false);
  }
}