// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    // Default route
    {path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)},

    // Home route
    {path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)},

    // Login route
    {path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)},

    // Admin navbar route
    {path: 'admin-navbar', loadComponent: () => import('./components/admin-nav-bar/admin-nav-bar.component').then(m => m.AdminNavbarComponent)},
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}