// src/app/components/class-list/class-list.component.ts

import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ClassService, Class } from '../../services/class.service';
import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    MatTableModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,

    AdminNavbarComponent
  ],
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.css'
})

export class ClassListComponent implements OnInit {

    constructor(
        private classService: ClassService,
        private router: Router
    ) { }

    displayedColumns: string[] = [
        'classDate',
        'classTime',
        'batch',
        'level',
        'medium',
        'tutor',
        'status',
        'transcript',
        'assessment',
        'meetingLink',
        'meetingId',
        'actions'
    ];

    classes: any[] = [];
    selectedClassId: string = '';

    @ViewChild('transcriptInput')
    transcriptInput!: ElementRef<HTMLInputElement>;

    ngOnInit(): void {

        this.loadClasses();

    }

    // =====================================
    // Load All Classes
    // =====================================

    loadClasses(): void {

        this.classService.getAllClasses().subscribe({

        next: (response: any[]) => {

            this.classes = response;

        },

        error: (err) => {

            console.error(err);

            alert("Failed to load classes.");

        }

        });

    }

    // =====================================
    // Create New Class
    // =====================================

    createClass(): void {

        this.router.navigate(['/create-class']);

    }

    // =====================================
    // Edit Class
    // =====================================

    editClass(classItem: Class): void {

        console.log("Edit:", classItem);

        // Later
        // this.router.navigate(['/edit-class', classItem._id]);

    }

    // =====================================
    // Delete Class
    // =====================================

    deleteClass(id: string): void {

        if (!confirm("Are you sure you want to delete this class?")) {

        return;

        }

        // Implement after backend delete API
        console.log("Delete:", id);

    }

    isCompleted(classItem: any): boolean {
        const end = new Date(classItem.classDate);
        const [hour, minute] = classItem.endTime.split(':');
        end.setHours(+hour, +minute, 0, 0);
        return new Date() >= end;
    }

    selectTranscript(classItem: any): void {
        this.selectedClassId = classItem._id;
        this.transcriptInput.nativeElement.value = '';
        this.transcriptInput.nativeElement.click();
    }

    // =====================================
    // Upload Transcript
    // =====================================

    uploadTranscript(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {

        return;

    }

    const file = input.files[0];

    this.classService
        .uploadTranscript(this.selectedClassId, file)

        .subscribe({

        next: () => {

            alert("Transcript uploaded successfully.");

            this.loadClasses();

        },

        error: (err) => {

            console.error(err);

            alert("Failed to upload transcript.");

        }

        });

    }

    // =====================================
    // Generate Assessment
    // =====================================

    generateAssessment(classItem: any): void {

    console.log("Generate Assessment");

    console.log(classItem);

    }

    // =====================================
    // View Assessment
    // =====================================

    viewAssessment(classItem: any): void {

    console.log("View Assessment");

    console.log(classItem);

    }

}