import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnswerService } from '../../services/answer.service';

import { StudentNavbarComponent } from '../student-side-bar/student-side-bar.component';


@Component({
  selector: 'app-student-results',

  standalone: true,

  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    StudentNavbarComponent
  ],

  templateUrl: './student-results.component.html',

  styleUrl: './student-results.component.css'
})
export class StudentResultsComponent
  implements OnInit {


  // =====================================
  // Results
  // =====================================

  results: any[] = [];


  // =====================================
  // Loading
  // =====================================

  isLoading = false;


  // =====================================
  // Error
  // =====================================

  errorMessage = '';


  constructor(
    private answerService: AnswerService
  ) {}


  // =====================================
  // On Init
  // =====================================

  ngOnInit(): void {

    this.loadResults();

  }


  // =====================================
  // Load Student Results
  // =====================================

  loadResults(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.answerService
      .getStudentResults()
      .subscribe({

        next: (response) => {

          console.log(
            'Student assessment results:',
            response
          );


          this.results = response;

          this.isLoading = false;

        },


        error: (err) => {

          console.error(
            'Error loading student results:',
            err
          );


          this.errorMessage =
            err.error?.msg ||
            'Failed to load your assessment results.';


          this.isLoading = false;

        }

      });

  }

}