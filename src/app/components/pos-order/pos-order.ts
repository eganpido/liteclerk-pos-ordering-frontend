import { Component, OnInit, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosOrderService } from '../pos-order/pos-order.service';
import { Router } from '@angular/router';

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
  tableNumber = signal<string>('');
  itemGroups = signal<any[]>([]);
  selectedGroupId = signal<number | null>(null);
  filteredItems = signal<any[]>([]);
  currentOrderItems = signal<any[]>([]);
  fullName = signal<string>('');
  terminalNumber = signal<string>('');

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
      next: (data: any) => {
        this.itemGroups.set(data);
      },
      error: (err: any) => console.error('Error loading groups:', err)
    });
  }

  loadOrderDetails() {
    const id = this.orderId();
    if (!id) return;

    this.posOrderService.getOrderItems(id).subscribe({
      next: (items: any) => this.currentOrderItems.set(items || []),
      error: (err) => console.error('Error items:', err)
    });

    this.posOrderService.getOrderById(id).subscribe({
      next: (res: any) => {
        if (res && res.order && res.order.orderNumber) {
          this.orderNumber.set(res.order.orderNumber);
          this.orderDate.set(res.order.orderDate);
        } else {
          console.warn('Warning: orderNumber is missing in res.order!', res);
          this.orderNumber.set(`ORD-${id}`);
        }
      },
      error: (err) => console.error('Error order info:', err)
    });
  }

  onGroupSelect(groupId: number) {
    this.selectedGroupId.set(groupId);
    this.posOrderService.getItemsByGroup(groupId).subscribe({
      next: (data: any) => {
        this.filteredItems.set(data);
      },
      error: (err: any) => console.error('Error loading items by group:', err)
    });
  }

  getGroupIcon(groupName: string): string {
    const name = groupName.toLowerCase();
    if (name.includes('rice')) return '🍚';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('appetizer')) return '🥗';
    if (name.includes('dessert')) return '🍰';
    if (name.includes('main') || name.includes('dish')) return '🍳';
    return '📦'; // Default icon
  }

  addToOrder(item: any) {
    const currentOrderId = this.orderId();

    const newItem = {
      orderId: currentOrderId,
      itemId: item._id,
      itemDescription: item.itemDescription,
      price: item.price,
      quantity: 1,
      subtotal: item.price * 1
    };

    this.posOrderService.saveOrderItem(newItem).subscribe({
      next: (res: any) => {
        console.log('Item saved!', res);
        this.loadOrderDetails();
      },
      error: (err: any) => console.error('Error saving item:', err)
    });
  }

  calculateSubtotal(): number {
    return this.currentOrderItems().reduce((acc, item) => acc + item.subtotal, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.12;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  goBack() {
    this.router.navigate(['/pos']);
  }
}