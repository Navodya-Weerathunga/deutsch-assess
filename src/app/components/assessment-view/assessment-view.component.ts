import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  AssessmentService,
  Assessment
} from '../../services/assessment.service';

import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';

@Component({
  selector: 'app-assessment-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    AdminNavbarComponent
  ],
  templateUrl: './assessment-view.component.html',
  styleUrl: './assessment-view.component.css'
})
export class AssessmentViewComponent implements OnInit {

  assessment: Assessment | null = null;

  isLoading = false;

  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute
  ) {}

  // =====================================
  // Initialize
  // =====================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      console.error('Assessment ID not found.');

      return;

    }

    this.loadAssessment(id);

  }

  // =====================================
  // Load Assessment
  // =====================================

  loadAssessment(id: string): void {

    this.isLoading = true;

    this.assessmentService
      .getAssessmentById(id)
      .subscribe({

        next: (assessment) => {

          this.assessment = assessment;

          this.isLoading = false;

        },

        error: (err) => {

          console.error(
            'Error loading assessment:',
            err
          );

          this.isLoading = false;

        }

      });

  }

}