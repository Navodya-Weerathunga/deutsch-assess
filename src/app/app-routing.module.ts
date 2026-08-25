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

    // Student navbar route
    {path: 'student-navbar', loadComponent: () => import('./components/student-side-bar/student-side-bar.component').then(m => m.StudentNavbarComponent)},

    // Tutor navbar route
    {path: 'tutor-navbar', loadComponent: () => import('./components/tutor-side-bar/tutor-side-bar.component').then(m => m.TutorSideBarComponent)},

    // Student list route - Admin view
    {path: 'student-list', loadComponent: () => import('./components/student-list/student-list.component').then(m => m.StudentListComponent)},

    // Student list route - Tutor view
    {path: 'tutor-student-list', loadComponent: () => import('./components/tutor-student-list/tutor-student-list.component').then(m => m.TutorStudentListComponent)},

    // Signup route
    {path: 'signup', loadComponent: () => import('./components/sign-up/sign-up.component').then(m => m.SignupComponent)},

    // Create class route
    {path: 'create-class', loadComponent: () => import('./components/class/class.component').then(m => m.CreateClassComponent)},

    // Class list route - Admin
    {path: 'classes', loadComponent: () => import('./components/class-list/class-list.component').then(m => m.ClassListComponent)},

    // Class list route - Tutor
    {path: 'tutor-classes', loadComponent: () => import('./components/tutor-class-list/tutor-class-list.component').then(m => m.TutorClassListComponent)},

    // Tutor list route
    {path: 'tutor-list', loadComponent: () => import('./components/tutor-list/tutor-list.component').then(m => m.TutorListComponent)},

    // Assessment list route - Admin
    {path: 'assessments', loadComponent: () => import('./components/assessment-list/assessment-list.component').then(m => m.AssessmentListComponent)},

    // Assessment list route - Tutor
    {path: 'tutor-assessments', loadComponent: () => import('./components/tutor-assessment-list/tutor-assessment-list.component').then(m => m.TutorAssessmentListComponent)},

    // Assessment view route
    {path: 'assessment/:id', loadComponent: () => import('./components/assessment-view/assessment-view.component').then(m => m.AssessmentViewComponent)},

    // Assessment view route - Tutor
    {path: 'tutor/assessment/:id', loadComponent: () => import('./components/assessment-view/assessment-view.component').then(m => m.AssessmentViewComponent)},

    // Student dashboard route
    {path: 'student-dashboard', loadComponent: () => import('./components/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)},

    // Student assessment list route
    {path: 'student-assessments', loadComponent: () => import('./components/student-assessment-list/student-assessment-list.component').then(m => m.StudentAssessmentListComponent)},

    // Student assessment view route
    {path: 'student-assessment/:id', loadComponent: () => import('./components/student-assessment-view/student-assessment-view.component').then(m => m.StudentAssessmentViewComponent)},

    // Student results route 
    {path: 'my-results', loadComponent: () => import('./components/student-results/student-results.component').then(m => m.StudentResultsComponent)},

    // Student results list route - Tutor
    {path: 'tutor-results', loadComponent: () => import('./components/tutor-view-results/tutor-view-results.component').then(m => m.TutorResultsComponent)},

    // Admin results route
    {path: 'admin-results', loadComponent: () => import('./components/admin-view-results/admin-view-results.component').then(m => m.AdminResultsComponent)},

    // Student assessment report route
    {path: 'student-assessment-report/:answerId', loadComponent: () => import('./components/student-assessment-report/student-assessment-report.component').then(m => m.StudentAssessmentReportComponent)}
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}