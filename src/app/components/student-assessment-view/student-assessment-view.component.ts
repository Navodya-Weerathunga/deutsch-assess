import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AssessmentService } from '../../services/assessment.service';
import { AnswerService } from '../../services/answer.service';

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

  // =====================================
  // Assessment Result
  // =====================================

  answerId: string | null = null;

  assessmentResult: any = null;

  isEvaluating = false;

  evaluationError = '';

  private evaluationInterval: any = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private answerService: AnswerService
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


    this.loadAssessment(
      assessmentId
    );

  }


  // =====================================
  // Load Assessment
  // =====================================

  loadAssessment(id: string): void {

    this.isLoading = true;

    this.errorMessage = '';


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


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedFile = null;

      return;

    }


    const file =
      input.files[0];


    // -----------------------------------
    // Allowed File Types
    // -----------------------------------

    const allowedTypes = [

      'application/pdf',

      'image/jpeg',

      'image/png'

    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        'Invalid file type. Please upload a PDF, JPG, or PNG file.'
      );


      input.value = '';

      this.selectedFile = null;

      return;

    }


    // -----------------------------------
    // Optional File Size Check
    // -----------------------------------

    const maxFileSize =
      10 * 1024 * 1024; // 10 MB


    if (
      file.size > maxFileSize
    ) {

      alert(
        'File size must not exceed 10 MB.'
      );


      input.value = '';

      this.selectedFile = null;

      return;

    }


    // -----------------------------------
    // Store Selected File
    // -----------------------------------

    this.selectedFile = file;

    this.successMessage = '';

    this.errorMessage = '';


    console.log(
      'Selected answer file:',
      file.name
    );

  }


  // =====================================
  // Upload Answers
  // =====================================

  uploadAnswers(): void {

    // -----------------------------------
    // Check Assessment
    // -----------------------------------

    if (!this.assessment?._id) {

      alert(
        'Assessment information is not available.'
      );

      return;

    }


    // -----------------------------------
    // Check File
    // -----------------------------------

    if (!this.selectedFile) {

      alert(
        'Please select your answer file first.'
      );

      return;

    }


    // -----------------------------------
    // Confirmation
    // -----------------------------------

    const confirmed = confirm(
      'Are you sure you want to submit your answers? You will not be able to submit this assessment again.'
    );


    if (!confirmed) {

      return;

    }


    // -----------------------------------
    // Start Upload
    // -----------------------------------

    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';


    console.log(
      'Uploading answer file:',
      this.selectedFile.name
    );


    // -----------------------------------
    // Upload through AnswerService
    // -----------------------------------

    this.answerService
      .uploadAnswers(
        this.assessment._id,
        this.selectedFile
      )
      .subscribe({

        // ---------------------------------
        // Success
        // ---------------------------------

        next: (response) => {

          console.log(
            'Answer upload successful:',
            response
          );

          // ---------------------------------
          // Store answerId for result checking
          // ---------------------------------

          this.answerId =
            response.answerId || null;
          

          // ---------------------------------
          // Start evaluation state
          // ---------------------------------  

          this.isLoading = false;

          this.isEvaluating = true;

          this.evaluationError = '';

          this.successMessage =
            response.msg ||
            'Your answers have been uploaded successfully.' +
            ' Your assessment is now being evaluated.';


          // Clear selected file

          this.selectedFile = null;


          // Clear file input

          const fileInput =
            document.getElementById(
              'answerFile'
            ) as HTMLInputElement;


          if (fileInput) {

            fileInput.value = '';

          }

          // -----------------------------------
          // Start checking assessment result
          // -----------------------------------

          this.startEvaluationPolling();

        },


        // ---------------------------------
        // Error
        // ---------------------------------

        error: (err) => {

          console.error(
            'Error uploading answers:',
            err
          );


          this.isLoading = false;


          this.errorMessage =
            err.error?.msg ||
            'Failed to upload your answers.';


          alert(
            this.errorMessage
          );

        }

      });

  }


  // =====================================
  // Check Assessment Result
  // =====================================

  checkAssessmentResult(): void {

    if (!this.answerId) {
      return;
    }

    console.log(
      'Checking assessment result:',
      this.answerId
    );

    this.answerService
      .getAnswerResult(this.answerId)
      .subscribe({

        next: (response) => {

          console.log(
            'Assessment result:',
            response
          );

          // -----------------------------------
          // Store current result
          // -----------------------------------

          this.assessmentResult = response;


          // -----------------------------------
          // Assessment completed
          // -----------------------------------

          if (
            response.assessmentStatus ===
            'COMPLETED'
          ) {

            console.log(
              'Assessment evaluation completed.'
            );

            this.isEvaluating = false;

            this.stopEvaluationPolling();

            return;
          }


          // -----------------------------------
          // Assessment failed
          // -----------------------------------

          if (
            response.assessmentStatus ===
            'FAILED'
          ) {

            console.error(
              'Assessment evaluation failed.'
            );

            this.isEvaluating = false;

            this.evaluationError =
              'Your answers were uploaded, but the assessment could not be evaluated.';

            this.stopEvaluationPolling();

            return;
          }


          // -----------------------------------
          // Still processing
          // -----------------------------------

          this.isEvaluating = true;

        },

        error: (err) => {

          console.error(
            'Error checking assessment result:',
            err
          );

          this.evaluationError =
            err.error?.msg ||
            'Unable to check assessment result.';

          this.isEvaluating = false;

          this.stopEvaluationPolling();

        }

      });

  }

  // =====================================
  // Start Result Polling
  // =====================================

  startEvaluationPolling(): void {

    // Prevent duplicate polling
    this.stopEvaluationPolling();


    // Check immediately
    this.checkAssessmentResult();


    // Then check every 3 seconds
    this.evaluationInterval =
      setInterval(() => {

        this.checkAssessmentResult();

      }, 3000);

  }

  // =====================================
  // Stop Result Polling
  // =====================================

  stopEvaluationPolling(): void {

    if (this.evaluationInterval) {

      clearInterval(
        this.evaluationInterval
      );

      this.evaluationInterval = null;

    }

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