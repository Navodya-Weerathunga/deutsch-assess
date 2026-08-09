import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AssessmentService } from '../../services/assessment.service';

import { StudentNavbarComponent } from '../student-side-bar/student-side-bar.component';

@Component({
  selector: 'app-student-assessment-list',
  standalone: true,
  imports: [

    CommonModule,

    RouterModule,

    MatCardModule,

    MatButtonModule,

    MatIconModule,

    MatProgressSpinnerModule,

    StudentNavbarComponent

  ],
  templateUrl: './student-assessment-list.component.html',
  styleUrl: './student-assessment-list.component.css'
})
export class StudentAssessmentListComponent implements OnInit {


  assessments: any[] = [];

  isLoading = false;


  constructor(
    private assessmentService: AssessmentService
  ) {}


  // =====================================
  // Initialize
  // =====================================

  ngOnInit(): void {

    this.loadAssessments();

  }


  // =====================================
  // Load Student Assessments
  // =====================================

  loadAssessments(): void {

    this.isLoading = true;

    this.assessmentService
      .getStudentAssessments()
      .subscribe({

        next: (response) => {

          console.log(
            'Student assessments:',
            response
          );

          this.assessments = response;

          this.isLoading = false;

        },

        error: (err) => {

          console.error(
            'Error loading student assessments:',
            err
          );

          this.isLoading = false;

        }

      });

  }

}