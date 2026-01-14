import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from './pos-main.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pos-main',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col lg:flex-row h-screen w-full bg-slate-100 font-['Open_Sans',sans-serif] text-slate-900 overflow-hidden">
      
      <aside class="w-full lg:w-80 bg-white border-b lg:border-r border-slate-200 p-3 sm:p-4 lg:p-6 flex flex-col shadow-sm flex-none">
    
        <div class="mb-4 lg:mb-8 flex items-center justify-center lg:justify-start gap-3">
            <div class="w-10 h-10 lg:w-14 lg:h-14 flex-none bg-white flex items-center justify-center overflow-hidden">
                <img src="/liteclerk.png" 
                    alt="Liteclerk Logo" 
                    class="w-full h-full object-contain p-1">
            </div>

            <div>
                <h1 class="text-lg lg:text-2xl font-semibold text-[#737274] tracking-tighter uppercase leading-none">
                    Liteclerk <span class="text-[#92c254]">POS</span>
                </h1>
            </div>
        </div>

        <h2 class="text-[14px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 py-2 hidden lg:block">
            Areas
        </h2>

        <div class="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:flex-1 lg:min-h-0 scrollbar-hide pb-2 lg:pb-0">
            @for (group of tableGroups(); track group.tableGroupId) {
            <button 
              (click)="onGroupClick(group.tableGroupId)"
              [class]="selectedGroup()?.tableGroupId === group.tableGroupId 
                  ? 'bg-[#2596be]/10 text-[#2596be] border-[#2596be]' 
                  : 'bg-transparent text-slate-800 border-transparent hover:bg-slate-50'"
              class="group flex items-center gap-3 lg:gap-4 flex-none w-auto lg:w-full px-4 lg:px-5 py-2.5 lg:py-4 rounded-xl text-left transition-all duration-300 border-b-4 lg:border-b-0 lg:border-l-[6px] active:scale-[0.95] whitespace-nowrap overflow-hidden">
              
              <div [class]="selectedGroup()?.tableGroupId === group.tableGroupId ? 'text-[#2596be]' : 'text-slate-500'"
                class="flex-none transition-colors duration-200 transform scale-100 lg:scale-125">
                @if (group.tableGroup.toLowerCase().includes('vip')) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>
                } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                }
              </div>

              <div class="flex flex-col">
                  <span class="text-sm lg:text-lg font-semibold tracking-tighter uppercase leading-none">
                    {{ group.tableGroup }}
                  </span>
                  <span class="text-[10px] font-bold opacity-60 tracking-wide mt-1 hidden lg:block text-[#476d14]">
                      {{ group.tables?.length || 0 }} TABLES
                  </span>
              </div>

              @if (selectedGroup()?.tableGroupId === group.tableGroupId) {
                  <div class="ml-auto hidden lg:block">
                      <div class="w-2 h-2 rounded-full bg-[#2596be] animate-pulse"></div>
                  </div>
              }
            </button>
            }
        </div>
        <div class="mt-auto pt-4 border-t border-slate-100">
        <button 
              (click)="onLogout()"
              class="flex items-center gap-3 w-full px-5 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group active:scale-[0.98]">
              <div class="flex-none p-2 bg-red-100 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                  </svg>
              </div>
              <span class="text-sm lg:text-base font-semibold uppercase tracking-widest">Logout</span>
          </button>
      </div>
    </aside>

      <main class="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto h-full bg-slate-100">
        @if (selectedGroup()) {
          <div class="mb-6 lg:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-800 uppercase">
                {{ selectedGroup().tableGroup }}
              </h1>
              <p class="text-slate-500 font-semibold text-xs sm:text-sm py-1">Select a table to start an order</p>
            </div>
            
            <div class="flex gap-2">
              <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                <span class="text-[10px] font-bold text-slate-600 uppercase">Occupied</span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
                <div class="w-2 h-2 rounded-full bg-[#92c254]"></div>
                <span class="text-[10px] font-bold text-slate-600 uppercase">Vacant</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 pb-8">
            @for (table of selectedGroup().tables; track table.tableId) {
              <div 
                (click)="onTableClick(table)"
                [class]="table.isOccupied 
                  ? 'bg-gradient-to-br from-red-50 to-white border-red-200 shadow-md shadow-red-100' 
                  : 'bg-white border-slate-100 hover:border-[#2596be] hover:shadow-xl hover:shadow-[#2596be]/10 hover:-translate-y-1 sm:hover:-translate-y-2 group'"
                class="relative aspect-[4/5] rounded-[1.5rem] sm:rounded-[2.5rem] border-2 flex flex-col items-center justify-between p-3 sm:p-5 lg:p-7 cursor-pointer transition-all duration-300 overflow-hidden">
                
                <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div class="absolute top-3 left-3 sm:top-5 sm:left-5">
                  <span [class]="table.isOccupied ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-[#476d14]'" 
                        class="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[8px] sm:text-[10px] font-semibild uppercase tracking-wider">
                    {{ table.isOccupied ? 'Occupied' : 'Vacant' }}
                  </span>
                </div>

                <div class="flex-1 flex items-center justify-center w-full mt-4 sm:mt-6">
                  <div class="relative w-12 h-12 sm:w-20 sm:h-20 lg:w-28 lg:h-28 flex items-center justify-center">
                    @if (table.isOccupied) {
                      <img src="https://cdn-icons-png.flaticon.com/512/3448/3448610.png" 
                          alt="Occupied Table"
                          class="w-full h-full object-contain filter drop-shadow-lg animate-pulse-slow">
                    } @else {
                      <img src="https://cdn-icons-png.flaticon.com/512/1663/1663945.png" 
                          alt="Vacant Table"
                          class="w-full h-full object-contain opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-105">
                    }
                    
                    @if (!table.isOccupied) {
                      <div class="absolute inset-0 bg-[#2596be]/10 blur-lg sm:blur-2xl rounded-full -z-10"></div>
                    }
                  </div>
                </div>

                <div class="w-full text-center pb-2 sm:pb-4">
                  <h3 [class]="table.isOccupied ? 'text-red-900' : 'text-slate-600'" 
                      class="text-base sm:text-xl lg:text-2xl font-semibold tracking-tighter leading-none group-hover:text-[#2596be] transition-colors">
                    {{ table.tableCode }}
                  </h3>
                </div>

                @if (table.isOccupied) {
                  <span class="absolute top-3 right-3 sm:top-6 sm:right-6 flex h-2 w-2 sm:h-3 sm:w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-red-500"></span>
                  </span>
                }
              </div>
            } @empty {
              <div class="col-span-full py-10 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p class="text-slate-400 font-bold italic text-sm">No tables found.</p>
              </div>
            }
          </div>
        } @else {
          <div class="h-full flex flex-col items-center justify-center text-center p-6">
            <div class="w-16 h-16 sm:w-24 sm:h-24 mb-6 rounded-full bg-slate-200 flex items-center justify-center text-2xl sm:text-4xl">
              🪑
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Ready to serve?</h2>
            <p class="text-slate-500 max-w-xs mt-2 font-bold text-xs sm:text-sm px-4">
              Please select a table area to see available tables.
            </p>
          </div>
        }
      </main>
    </div>
  `
})
export class PosMain implements OnInit {
  private posService = inject(PosService);
  private router = inject(Router);

  tableGroups = signal<any[]>([]);
  selectedGroup = signal<any>(null);

  ngOnInit() {
    this.fetchInitialData();
  }

  fetchInitialData() {
    this.posService.getTableGroups().subscribe({
      next: (data) => {
        this.tableGroups.set(data);
        if (data.length > 0) {
          this.onGroupClick(data[0].tableGroupId);
        }
      },
      error: (err) => console.error('Failed to load table groups:', err)
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
    console.log('Selected Table:', table);
    alert(`Selected: ${table.tableName}. Next: Load Menu Items!`);
  }

  onLogout() {
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}