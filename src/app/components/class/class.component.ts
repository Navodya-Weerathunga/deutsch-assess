// src/app/components/create-class/create-class.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ClassService } from '../../services/class.service';
import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';

@Component({
  selector: 'app-create-class',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    AdminNavbarComponent,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './class.component.html',
  styleUrl: './class.component.css'
})

export class CreateClassComponent {

  constructor(private classService: ClassService) {}

  batches: string[] = [
    '1',
    '2',
    '3',
    '4',
    '5'
  ];

  tutors: any[] = [];

  classData = {
    topic: '',
    classDate: null as Date | null,
    startTime: '',
    endTime: '',
    batch: '',
    medium: '',
    level: '',
    tutor: ''

  };

  // ===============================
  // Load Tutors
  // ===============================

  loadTutors(): void {

    if (
      !this.classData.batch ||
      !this.classData.medium ||
      !this.classData.level
    ) {
      return;
    }

    this.classService.getAvailableTutors(
      this.classData.medium,
      this.classData.level,
      this.classData.batch
    ).subscribe({

      next: (response: any[]) => {
        this.tutors = response;
        // Auto select if only one tutor exists
        if (this.tutors.length === 1) {
          this.classData.tutor = this.tutors[0]._id;
        }
      },

      error: (err) => {
        console.error(err);
        this.tutors = [];
      }

    });

  }

  // ===============================
  // Create Zoom Meeting
  // ===============================

  createMeeting(): void {

    if (!this.classData.classDate) {
      alert("Please select a class date.");
      return;
    }

    const payload = {
      ...this.classData,
      classDate: new Date(
        this.classData.classDate.getTime() -
        this.classData.classDate.getTimezoneOffset() * 60000
      ).toISOString()
    };

    this.classService.createClass(payload)
      .subscribe({
        next: (response) => {
          alert("Zoom Meeting Created Successfully!");
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.msg || "Failed to create Zoom Meeting.");
        }
      });

  }

  // ===============================
  // Reset Form
  // ===============================

  resetForm(): void {

    this.classData = {
      topic: '',
      classDate: null,
      startTime: '',
      endTime: '',
      batch: '',
      medium: '',
      level: '',
      tutor: ''
    };

    this.tutors = [];

  }

}