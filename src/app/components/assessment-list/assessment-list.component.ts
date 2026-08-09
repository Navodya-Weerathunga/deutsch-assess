import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { AssessmentService, Assessment } from '../../services/assessment.service';

import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    AdminNavbarComponent
  ],

  templateUrl: './assessment-list.component.html',
  styleUrl: './assessment-list.component.css'

})

export class AssessmentListComponent implements OnInit {

  // =====================================
  // Table Columns
  // =====================================

  displayedColumns: string[] = [
    'title',
    'level',
    'topic',
    'classDate',
    'questions',
    'totalMarks',
    'actions'
  ];

  // =====================================
  // Assessments
  // =====================================

  assessments: Assessment[] = [];

  filteredAssessments: Assessment[] = [];

  isLoading = false;

  searchText = '';

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
  // Load Assessments
  // =====================================

  loadAssessments(): void {

    this.isLoading = true;

    this.assessmentService.getAllAssessments().subscribe({

      next: (assessments: Assessment[]) => {

        this.assessments = assessments;

        this.filteredAssessments = assessments;

        this.isLoading = false;

      },

      error: (err) => {

        console.error('Error loading assessments:', err);

        this.isLoading = false;

      }

    });

  }

  // =====================================
  // Search Assessments
  // =====================================

  searchAssessments(): void {

    const search = this.searchText
      .toLowerCase()
      .trim();

    if (!search) {

      this.filteredAssessments = this.assessments;

      return;

    }

    this.filteredAssessments = this.assessments.filter(
      (assessment) =>

        assessment.title
          ?.toLowerCase()
          .includes(search)

        ||

        assessment.topic
          ?.toLowerCase()
          .includes(search)

        ||

        assessment.level
          ?.toLowerCase()
          .includes(search)

    );

  }

  // =====================================
  // View Assessment
  // =====================================

  viewAssessment(assessment: Assessment): void {

    console.log('View Assessment:', assessment);

    // We will add navigation here later.
    // Example:
    // this.router.navigate(['/admin/assessments', assessment._id]);

  }

}