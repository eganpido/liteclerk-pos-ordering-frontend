import { Routes } from '@angular/router';
import { PosMain } from './components/pos-main/pos-main';
import { PosLogin } from './components/pos-login/pos-login';
import { authGuard } from './auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: PosLogin },
    { path: 'pos', component: PosMain, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];