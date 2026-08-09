// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    // Default route
    {path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)},

    // Home route
    {path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)},

    // Login route
    {path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)},

    // Admin navbar route
    {path: 'admin-navbar', loadComponent: () => import('./components/admin-nav-bar/admin-nav-bar.component').then(m => m.AdminNavbarComponent)},

    // Student list route
    {path: 'student-list', loadComponent: () => import('./components/student-list/student-list.component').then(m => m.StudentListComponent)},

    // Signup route
    {path: 'signup', loadComponent: () => import('./components/sign-up/sign-up.component').then(m => m.SignupComponent)},

    // Create class route
    {path: 'create-class', loadComponent: () => import('./components/class/class.component').then(m => m.CreateClassComponent)},

    // Class list route
    {path: 'classes', loadComponent: () => import('./components/class-list/class-list.component').then(m => m.ClassListComponent)},

    // Tutor list route
    {path: 'tutor-list', loadComponent: () => import('./components/tutor-list/tutor-list.component').then(m => m.TutorListComponent)},

    // Assessment list route
    {path: 'assessments', loadComponent: () => import('./components/assessment-list/assessment-list.component').then(m => m.AssessmentListComponent)},
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}