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
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}