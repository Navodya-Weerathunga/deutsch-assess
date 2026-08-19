import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnswerService } from '../../services/answer.service';

import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';


@Component({
  selector: 'app-admin-results',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AdminNavbarComponent
  ],

  templateUrl: './admin-view-results.component.html',

  styleUrl: './admin-view-results.component.css'
})

export class AdminResultsComponent
  implements OnInit {


  // =========================================
  // Results
  // =========================================

  results: any[] = [];


  // =========================================
  // Filtered Results
  // =========================================

  filteredResults: any[] = [];


  // =========================================
  // Loading
  // =========================================

  isLoading = false;


  // =========================================
  // Error
  // =========================================

  errorMessage = '';


  // =========================================
  // Search
  // =========================================

  searchTerm = '';


  // =========================================
  // Level Filter
  // =========================================

  selectedLevel = '';


  levels: string[] = [

    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2'

  ];


  // =========================================
  // Batch Filter
  // =========================================

  selectedBatch = '';


  batches: string[] = [];


  // =========================================
  // Constructor
  // =========================================

  constructor(
    private answerService: AnswerService
  ) {}


  // =========================================
  // On Init
  // =========================================

  ngOnInit(): void {

    this.loadResults();

  }


  // =========================================
  // Load All Results
  // =========================================

  loadResults(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.answerService
      .getAdminResults(
        this.selectedLevel ||
          undefined,

        this.selectedBatch ||
          undefined,

        this.searchTerm.trim() ||
          undefined
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Admin assessment results:',
            response
          );


          this.results =
            response || [];


          this.filteredResults =
            this.results;


          this.extractBatches();


          this.isLoading = false;

        },


        error: (error) => {

          console.error(
            'Error loading admin results:',
            error
          );


          this.results = [];

          this.filteredResults = [];


          this.errorMessage =
            error.error?.msg ||
            'Failed to load assessment results.';


          this.isLoading = false;

        }

      });

  }


  // =========================================
  // Extract Batches
  // =========================================

  extractBatches(): void {

    const batchSet =
      new Set<string>();


    this.results.forEach(
      result => {

        // -------------------------------------
        // Student batch
        // -------------------------------------

        if (
          Array.isArray(
            result.student?.batch
          )
        ) {

          result.student.batch.forEach(
            (batch: string) => {

              if (batch) {

                batchSet.add(batch);

              }

            }
          );

        }


        // -------------------------------------
        // Class batch
        // -------------------------------------

        if (
          result.class?.batch
        ) {

          batchSet.add(
            result.class.batch
          );

        }

      }
    );


    this.batches =
      Array.from(batchSet).sort();

  }


  // =========================================
  // Search
  // =========================================

  onSearch(): void {

    this.loadResults();

  }


  // =========================================
  // Level Filter
  // =========================================

  onLevelChange(): void {

    this.loadResults();

  }


  // =========================================
  // Batch Filter
  // =========================================

  onBatchChange(): void {

    this.loadResults();

  }


  // =========================================
  // Clear Filters
  // =========================================

  clearFilters(): void {

    this.searchTerm = '';

    this.selectedLevel = '';

    this.selectedBatch = '';


    this.loadResults();

  }


  // =========================================
  // Check Active Filters
  // =========================================

  hasActiveFilters(): boolean {

    return (
      this.searchTerm.trim() !== '' ||
      this.selectedLevel !== '' ||
      this.selectedBatch !== ''
    );

  }


  // =========================================
  // Get Student Full Name
  // =========================================

  getStudentName(
    result: any
  ): string {

    const firstName =
      result.student?.firstName || '';

    const lastName =
      result.student?.lastName || '';


    return (
      `${firstName} ${lastName}`
    ).trim();

  }


  // =========================================
  // Get Student Batch
  // =========================================

  getStudentBatch(
    result: any
  ): string {

    const batch =
      result.student?.batch;


    if (
      Array.isArray(batch)
    ) {

      return batch.join(', ');

    }


    return batch || '-';

  }


  // =========================================
  // Get Result Level
  // =========================================

  getResultLevel(
    result: any
  ): string {

    return (
      result.assessment?.level ||
      result.class?.level ||
      '-'
    );

  }


  // =========================================
  // Get Percentage
  // =========================================

  getPercentage(
    result: any
  ): number {

    const awarded =
      Number(
        result.totalMarksAwarded || 0
      );


    const total =
      Number(
        result.assessment?.totalMarks || 0
      );


    if (total <= 0) {

      return 0;

    }


    return (
      (awarded / total) * 100
    );

  }


  // =========================================
  // View Result
  // =========================================

  viewResult(
    result: any
  ): void {

    console.log(
      'Selected result:',
      result
    );


    /*
     * We will connect this to the
     * detailed admin result page later.
     */

  }

}