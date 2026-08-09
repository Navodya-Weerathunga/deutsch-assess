import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StudentNavbarComponent } from '../student-side-bar/student-side-bar.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,

    StudentNavbarComponent
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {

  // =====================================
  // Temporary Dashboard Data
  // =====================================

  studentName = 'Student';

  totalClasses = 5;

  totalAssessments = 2;

  // =====================================
  // Upcoming Class
  // =====================================

  upcomingClass = {

    topic: 'A1 - Numbers',
    level: 'A1',
    date: '01/07/2026',
    time: '20:30',
    tutor: 'German Tutor',
    zoomJoinUrl: ''

  };


  // =====================================
  // Latest Assessment
  // =====================================

  latestAssessment = {

    title: 'A1 German Assessment',
    topic: 'Numbers and Personal Information',
    level: 'A1',
    totalMarks: 100,
    id: ''

  };


  // =====================================
  // Join Class
  // =====================================

  joinClass(): void {

    if (!this.upcomingClass.zoomJoinUrl) {

      alert('The class meeting link is not available yet.');
      return;

    }

    window.open(
      this.upcomingClass.zoomJoinUrl,
      '_blank'
    );

  }

}