import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, switchMap, map } from 'rxjs';
import { APP_CONFIG } from '../../constants/config';

@Injectable({ providedIn: 'root' })
export class PosService {
    private http = inject(HttpClient);
    private apiUrl = APP_CONFIG.apiUrl;

    getTableGroups(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/table-groups`);
    }

    getTableGroupsWithTables(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/table-groups`).pipe(
            switchMap((groups: any[]) => {
                if (!groups || groups.length === 0) return [[]];

                const requests = groups.map(group =>
                    this.getTablesByGroup(group.tableGroupId).pipe(
                        map(response => {
                            let finalTables = [];

                            if (Array.isArray(response) && response.length > 0 && response[0].tables) {
                                finalTables = response[0].tables;
                            } else if (Array.isArray(response)) {
                                finalTables = response;
                            }

                            return {
                                ...group,
                                tables: finalTables
                            };
                        })
                    )
                );

                return forkJoin(requests);
            })
        );
    }

    getTablesByGroup(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/table-groups/tables/${id}`);
    }

    createNewOrder(tableId: number): Observable<any> {
        const orderPayload = {
            orderData: {
                tableId: tableId,
                customerId: 1,
                terminalId: Number(localStorage.getItem('terminalId')) || 1,
                totalAmount: 0
            },
            items: []
        };

        return this.http.post(`${this.apiUrl}/orders`, orderPayload);
    }

    getActiveOrderByTable(tableId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/orders/active/${tableId}`);
    }

    clearAndVacantTable(orderId: number, tableId: number) {
        return this.http.delete(`${this.apiUrl}/orders/reset-table/${orderId}/${tableId}`);
    }
}