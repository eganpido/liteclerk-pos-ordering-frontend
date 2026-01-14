import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PosService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000';

    getTableGroups(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/table-groups`);
    }

    getTablesByGroup(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/table-groups/tables/${id}`);
    }
}