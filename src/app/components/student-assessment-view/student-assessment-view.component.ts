import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AssessmentService } from '../../services/assessment.service';

import { StudentNavbarComponent } from '../student-side-bar/student-side-bar.component';

@Component({
  selector: 'app-student-assessment-view',
  standalone: true,

  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    StudentNavbarComponent
  ],

  templateUrl: './student-assessment-view.component.html',

  styleUrl: './student-assessment-view.component.css'
})
export class StudentAssessmentViewComponent implements OnInit {

  assessment: any = null;

  isLoading = false;

  selectedFile: File | null = null;

  errorMessage = '';

  successMessage = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService
  ) {}


  // =====================================
  // Initialize
  // =====================================

  ngOnInit(): void {

    const assessmentId =
      this.route.snapshot.paramMap.get('id');

    if (!assessmentId) {

      this.errorMessage =
        'Assessment ID was not found.';

      return;

    }

    this.loadAssessment(assessmentId);

  }


  // =====================================
  // Load Assessment
  // =====================================

  loadAssessment(id: string): void {

    this.isLoading = true;

    this.assessmentService
      .getStudentAssessment(id)
      .subscribe({

        next: (response) => {

          console.log(
            'Student assessment:',
            response
          );

          this.assessment = response;

          this.isLoading = false;

        },

        error: (err) => {

          console.error(
            'Error loading assessment:',
            err
          );

          this.errorMessage =
            err.error?.msg ||
            'Failed to load assessment.';

          this.isLoading = false;

        }

      });

  }


  // =====================================
  // File Selected
  // =====================================

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {

      this.selectedFile = null;

      return;

    }

    const file = input.files[0];


    // -----------------------------------
    // Allowed file types
    // -----------------------------------

    const allowedTypes = [

      'application/pdf',

      'image/jpeg',

      'image/png'

    ];


    if (!allowedTypes.includes(file.type)) {

      alert(
        'Invalid file type. Please upload a PDF, JPG, or PNG file.'
      );

      input.value = '';

      this.selectedFile = null;

      return;

    }


    this.selectedFile = file;

    this.successMessage = '';

  }


  // =====================================
  // Upload Answers
  // =====================================

  uploadAnswers(): void {

    if (!this.selectedFile) {

      alert(
        'Please select your answer file first.'
      );

      return;

    }


    console.log(
      'Answer file selected:',
      this.selectedFile
    );


    /*
     * We will connect this button to the
     * backend Answer submission endpoint
     * after creating that endpoint.
     */

    alert(
      'Answer file selected successfully. Upload functionality will be connected next.'
    );

  }


  // =====================================
  // Go Back
  // =====================================

  goBack(): void {

    this.router.navigate([
      '/student/assessments'
    ]);

  }


  // =====================================
  // Get File Name
  // =====================================

  getFileName(): string {

    if (!this.selectedFile) {

      return 'No file selected';

    }

    return this.selectedFile.name;

  }

}