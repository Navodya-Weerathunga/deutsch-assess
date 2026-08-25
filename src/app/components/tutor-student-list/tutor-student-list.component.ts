import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { TutorSideBarComponent } from '../tutor-side-bar/tutor-side-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tutor-student-list',
  templateUrl: './tutor-student-list.component.html',
  styleUrls: ['./tutor-student-list.component.css'],

  imports: [
    MatIcon, 
    MatProgressSpinner, 
    TutorSideBarComponent, 
    CommonModule
]

})
export class TutorStudentListComponent implements OnInit {

  students: any[] = [];

  isLoading = false;

  errorMessage = '';


  constructor(
    private userService: UserService
  ) {}


  ngOnInit(): void {

    this.loadStudents();

  }


  // =========================================
  // Load Tutor Students
  // =========================================

  loadStudents(): void {

    this.isLoading = true;

    this.errorMessage = '';


    this.userService
      .getTutorStudents()
      .subscribe({

        next: (data) => {

          console.log(
            'Tutor students:',
            data
          );

          this.students = data;

          this.isLoading = false;

        },

        error: (error) => {

          console.error(
            'Error loading tutor students:',
            error
          );

          this.errorMessage =
            error.error?.msg ||
            'Failed to load students.';

          this.isLoading = false;

        }

      });

  }


  // =========================================
  // Get Student Name
  // =========================================

  getStudentName(
    student: any
  ): string {

    return `${student.firstName || ''} ${student.lastName || ''}`
      .trim();

  }


  // =========================================
  // Get Assigned Courses
  // =========================================

  getAssignedCourses(
    student: any
  ): string {

    if (
      !student.assignedCourses ||
      student.assignedCourses.length === 0
    ) {

      return 'No courses assigned';

    }

    if (
      Array.isArray(student.assignedCourses)
    ) {

      return student.assignedCourses.join(', ');

    }

    return student.assignedCourses;

  }

}