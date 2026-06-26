import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UserService, User } from '../../services/user.service';
import { AdminNavbarComponent } from '../admin-nav-bar/admin-nav-bar.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    AdminNavbarComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {

  displayedColumns: string[] = [
    'regNo',
    'name',
    'email',
    'plan',
    'status',
    'level',
    'actions'
  ];

  students: User[] = [];

  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {

    this.isLoading = true;

    this.userService.getAllStudents().subscribe({

      next: (students: User[]) => {

        this.students = students;
        this.isLoading = false;

      },

      error: (err) => {

        console.error('Error loading students:', err);
        this.isLoading = false;

      }

    });

  }

  editStudent(student: User): void {

    console.log('Edit:', student);

    // TODO:
    // this.router.navigate(['/admin/edit-student', student._id]);

  }

  updateStudent(student: User): void {

    console.log('Update:', student);

    // TODO:
    // Open update dialog or navigate to update page

  }

}