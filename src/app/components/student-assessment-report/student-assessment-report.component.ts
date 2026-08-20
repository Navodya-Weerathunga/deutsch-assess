import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnswerService } from '../../services/answer.service';


@Component({
  selector: 'app-student-assessment-report',

  standalone: true,

  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],

  templateUrl:
    './student-assessment-report.component.html',

  styleUrl:
    './student-assessment-report.component.css'
})
export class StudentAssessmentReportComponent
  implements OnInit {


  // =========================================
  // Answer ID
  // =========================================

  answerId = '';


  // =========================================
  // Result
  // =========================================

  result: any = null;


  // =========================================
  // Loading
  // =========================================

  isLoading = false;


  // =========================================
  // Error
  // =========================================

  errorMessage = '';


  // =========================================
  // Constructor
  // =========================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService
  ) {}


  // =========================================
  // On Init
  // =========================================

  ngOnInit(): void {

    this.answerId =
      this.route.snapshot.paramMap.get(
        'answerId'
      ) || '';


    if (!this.answerId) {

      this.errorMessage =
        'Invalid assessment result.';

      return;

    }


    this.loadResult();

  }


  // =========================================
  // Load Result
  // =========================================

  loadResult(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.answerService
      .getAnswerResult(this.answerId)
      .subscribe({

        next: (response) => {

          console.log(
            'Assessment report:',
            response
          );


          this.result = response;

          this.isLoading = false;

        },


        error: (error) => {

          console.error(
            'Error loading assessment report:',
            error
          );


          this.result = null;


          if (error.status === 403) {

            this.errorMessage =
              'You are not authorized to view this assessment result.';

          }
          else if (error.status === 404) {

            this.errorMessage =
              'Assessment result not found.';

          }
          else {

            this.errorMessage =
              error.error?.msg ||
              'Failed to load assessment report.';

          }


          this.isLoading = false;

        }

      });

  }


  // =========================================
  // Get Student Name
  // =========================================

  getStudentName(): string {

    if (!this.result?.student) {

      return '-';

    }


    const firstName =
      this.result.student.firstName || '';

    const lastName =
      this.result.student.lastName || '';


    return (
      `${firstName} ${lastName}`
    ).trim() || '-';

  }


  // =========================================
  // Get Student Batch
  // =========================================

  getStudentBatch(): string {

    const batch =
      this.result?.student?.batch;


    if (Array.isArray(batch)) {

      return batch.join(', ');

    }


    return batch || '-';

  }


  // =========================================
  // Get Total Marks
  // =========================================

  getTotalMarks(): number {

    return Number(
      this.result?.assessment?.totalMarks || 0
    );

  }


  // =========================================
  // Get Awarded Marks
  // =========================================

  getAwardedMarks(): number {

    return Number(
      this.result?.totalMarksAwarded || 0
    );

  }


  // =========================================
  // Get Percentage
  // =========================================

  getPercentage(): number {

    const total =
      this.getTotalMarks();

    const awarded =
      this.getAwardedMarks();


    if (total <= 0) {

      return 0;

    }


    return (
      (awarded / total) * 100
    );

  }


  // =========================================
  // Get OCR Answer
  // =========================================

  getStudentAnswer(
    questionNo: number
  ): string {

    const answers =
      this.result?.ocrAnswers || [];


    const answer =
      answers.find(
        (item: any) =>
          Number(item.questionNo) ===
          Number(questionNo)
      );


    return answer?.answer || 'No answer recorded.';

  }


  // =========================================
  // Get Question Result
  // =========================================

  getQuestionResult(
    questionNo: number
  ): any {

    const questionResults =
      this.result?.questionResults || [];


    return questionResults.find(
      (item: any) =>
        Number(item.questionNo) ===
        Number(questionNo)
    ) || null;

  }


  // =========================================
  // Get Awarded Marks For Question
  // =========================================

  getQuestionAwardedMarks(
    questionNo: number
  ): number {

    const result =
      this.getQuestionResult(
        questionNo
      );


    return Number(
      result?.awardedMarks || 0
    );

  }


  // =========================================
  // Get Question Maximum Marks
  // =========================================

  getQuestionMaximumMarks(
    question: any
  ): number {

    return Number(
      question?.marks || 0
    );

  }


  // =========================================
  // Get Task Completion Percentage
  // =========================================

  getTaskCompletionPercentage(
    questionNo: number
  ): number {

    const result =
      this.getQuestionResult(
        questionNo
      );


    return Number(
      result?.taskCompletion || 0
    ) * 100;

  }


  // =========================================
  // Get Language Score
  // =========================================

  getLanguageScore(
    questionNo: number
  ): number {

    const result =
      this.getQuestionResult(
        questionNo
      );


    return Number(
      result?.languageScore || 0
    );

  }


  // =========================================
  // Get XLM-R Score
  // =========================================

  getXlmScore(
    questionNo: number
  ): number {

    const result =
      this.getQuestionResult(
        questionNo
      );


    return Number(
      result?.xlmScore || 0
    );

  }


  // =========================================
  // Get Task Reason
  // =========================================

  getTaskReason(
    questionNo: number
  ): string {

    const result =
      this.getQuestionResult(
        questionNo
      );


    return (
      result?.taskReason ||
      'No feedback available.'
    );

  }


  // =========================================
  // Go Back
  // =========================================

  goBack(): void {

    this.router.navigate([
      '/student/results'
    ]);

  }

}