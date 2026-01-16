import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../../constants/config';


@Injectable({
    providedIn: 'root'
})
export class PosOrderService {
    private apiUrl = APP_CONFIG.apiUrl;

    constructor(private http: HttpClient) { }

    getOrderById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orders/${id}`);
    }

    getItemGroups(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/item-groups`);
    }

    getItemsByGroup(groupId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/item-group-items/by-group/${groupId}`);
    }

    saveOrderItem(itemData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/orders/item`, itemData);
    }

    getOrderItems(orderId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/orders/${orderId}/items`);
    }

    updateItemQuantity(orderItemId: number, quantity: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/orders/item/${orderItemId}`, { quantity });
    }

    removeOrderItem(orderItemId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/orders/item/${orderItemId}`);
    }
}