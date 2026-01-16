import { Routes } from '@angular/router';
import { PosMain } from './components/pos-main/pos-main';
import { PosLogin } from './components/pos-login/pos-login';
import { PosOrder } from './components/pos-order/pos-order';
import { authGuard } from './auth-guard';

export const routes: Routes = [
    { path: 'login', component: PosLogin },
    {
        path: 'pos',
        component: PosMain,
        canActivate: [authGuard]
    },
    {
        path: 'pos-order/:orderId', // Siguroha nga :orderId kini
        component: PosOrder,
        canActivate: [authGuard]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];