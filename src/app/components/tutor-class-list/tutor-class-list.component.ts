import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { ClassService, Class } from '../../services/class.service';
import { TutorSideBarComponent } from '../tutor-side-bar/tutor-side-bar.component';


@Component({
  selector: 'app-tutor-class-list',

  standalone: true,

  imports: [

    CommonModule,
    MatTableModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    TutorSideBarComponent

  ],

  templateUrl: './tutor-class-list.component.html',
  styleUrl: './tutor-class-list.component.css'
})
export class TutorClassListComponent
  implements OnInit {


  // =====================================
  // Table Columns
  // =====================================

  displayedColumns: string[] = [
    'classDate',
    'classTime',
    'topic',
    'batch',
    'level',
    'medium',
    'status',
    'meetingLink'
  ];


  // =====================================
  // Classes
  // =====================================

  classes: Class[] = [];


  // =====================================
  // Loading
  // =====================================

  isLoading = false;
  errorMessage = '';


  // =====================================
  // Constructor
  // =====================================

  constructor(
    private classService: ClassService,
  ) {}


  // =====================================
  // On Init
  // =====================================

  ngOnInit(): void {

    this.loadClasses();

  }


  // =====================================
  // Load Tutor Classes
  // =====================================

  loadClasses(): void {

    this.isLoading = true;
    this.errorMessage = '';


    this.classService
      .getTutorClasses()
      .subscribe({

        next: (response: Class[]) => {

          console.log(
            'Tutor classes:',
            response
          );

          this.classes = response;

          this.isLoading = false;

        },


        error: (err) => {

          console.error(
            'Error loading tutor classes:',
            err
          );

          this.errorMessage =
            err.error?.msg ||
            'Failed to load classes.';

          this.isLoading = false;

        }

      });

  }


  // =====================================
  // Check Class Status
  // =====================================

  getStatus(
    classItem: Class
  ): string {

    return (classItem as any).status ||
      'UPCOMING';

  }

}