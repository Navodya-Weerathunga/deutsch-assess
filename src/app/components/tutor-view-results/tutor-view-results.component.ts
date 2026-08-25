import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Router } from '@angular/router';

import { AnswerService } from '../../services/answer.service';

import { TutorSideBarComponent }
  from '../tutor-side-bar/tutor-side-bar.component';


@Component({
  selector: 'app-tutor-results',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    MatIconModule,

    MatButtonModule,

    MatProgressSpinnerModule,

    TutorSideBarComponent

  ],

  templateUrl:
    './tutor-view-results.component.html',

  styleUrl:
    './tutor-view-results.component.css'
})
export class TutorResultsComponent
  implements OnInit {


  // =========================================
  // Results
  // =========================================

  results: any[] = [];


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

    private answerService:
      AnswerService,

    private router:
      Router

  ) {}


  // =========================================
  // On Init
  // =========================================

  ngOnInit(): void {

    this.loadResults();

  }


  // =========================================
  // Load Tutor Results
  // =========================================

  loadResults(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.answerService.getTutorAssessmentResults(

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
            'Tutor assessment results:',
            response
          );


          this.results =
            response || [];


          this.extractBatches();


          this.isLoading = false;

        },


        error: (error) => {

          console.error(
            'Error loading tutor results:',
            error
          );


          this.results = [];


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
        // Student Batch
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
        // Class Batch
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

    const answerId =
      result?.answerId;


    console.log(
      'Selected tutor result:',
      result
    );


    if (!answerId) {

      console.error(
        'Answer ID is missing from selected result.'
      );

      return;

    }


    this.router.navigate([
      '/student-assessment-report',
      answerId
    ]);

  }

}