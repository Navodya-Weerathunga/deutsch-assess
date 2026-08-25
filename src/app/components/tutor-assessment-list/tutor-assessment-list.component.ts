import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { FormsModule } from '@angular/forms';

import {
    AssessmentService,
    Assessment
} from '../../services/assessment.service';

import { TutorSideBarComponent } from '../tutor-side-bar/tutor-side-bar.component';


@Component({

    selector:
        'app-tutor-assessment-list',

    standalone: true,

    imports: [

        CommonModule,
        RouterModule,
        MatTableModule,
        MatCardModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        FormsModule,
        TutorSideBarComponent

    ],

    templateUrl: './tutor-assessment-list.component.html',
    styleUrl: './tutor-assessment-list.component.css'

})
export class TutorAssessmentListComponent
    implements OnInit {


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


    // =====================================
    // Loading
    // =====================================

    isLoading = false;


    // =====================================
    // Error
    // =====================================

    errorMessage = '';


    // =====================================
    // Search
    // =====================================

    searchText = '';


    // =====================================
    // Constructor
    // =====================================

    constructor(

        private assessmentService:
            AssessmentService,

        private router:
            Router

    ) {}


    // =====================================
    // Initialize
    // =====================================

    ngOnInit(): void {

        this.loadAssessments();

    }


    // =====================================
    // Load Tutor Assessments
    // =====================================

    loadAssessments(): void {

        this.isLoading = true;

        this.errorMessage = '';


        this.assessmentService
            .getTutorAssessments()
            .subscribe({

                next:
                    (assessments:
                        Assessment[]) => {

                        console.log(
                            'Tutor assessments:',
                            assessments
                        );


                        this.assessments =
                            assessments;


                        this.filteredAssessments =
                            assessments;


                        this.isLoading = false;

                    },


                error:
                    (err) => {

                        console.error(
                            'Error loading tutor assessments:',
                            err
                        );


                        this.errorMessage =
                            err.error?.msg ||
                            'Failed to load assessments.';


                        this.isLoading = false;

                    }

            });

    }


    // =====================================
    // Search Assessments
    // =====================================

    searchAssessments(): void {

        const search =
            this.searchText
                .toLowerCase()
                .trim();


        // ---------------------------------
        // Empty Search
        // ---------------------------------

        if (!search) {

            this.filteredAssessments =
                this.assessments;

            return;

        }


        // ---------------------------------
        // Filter
        // ---------------------------------

        this.filteredAssessments =
            this.assessments.filter(

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

    if (!assessment._id) {

        console.error('Assessment ID is missing.');

        return;

    }

    this.router.navigate([
        '/tutor/assessment',
        assessment._id
    ]);

    }

}