// src/app/components/class-list/class-list.component.ts

import { Component, OnInit } from '@angular/core';
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
    'meetingLink',
    'meetingId',
    'actions'
  ];

  classes: any[] = [];

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

}