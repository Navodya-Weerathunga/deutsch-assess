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
  selector: 'app-tutor-list',
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
  templateUrl: './tutor-list.component.html',
  styleUrl: './tutor-list.component.css'
})
export class TutorListComponent implements OnInit {

  displayedColumns: string[] = [
    'regNo',
    'name',
    'email',
    'level',
    'medium',
    'actions'
  ];

  tutors: User[] = [];

  isLoading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadTutors();
  }

  loadTutors(): void {

    this.isLoading = true;

    this.userService.getAllTutors().subscribe({

      next: (tutors: User[]) => {

        this.tutors = tutors;
        this.isLoading = false;

      },

      error: (err) => {

        console.error('Error loading tutors:', err);
        this.isLoading = false;

      }

    });

  }

  editTutor(tutor: User): void {

    console.log('Edit:', tutor);

    // TODO:
    // this.router.navigate(['/admin/edit-tutor', tutor._id]);

  }

  updateTutor(tutor: User): void {

    console.log('Update:', tutor);

    // TODO:
    // Open update dialog or navigate to update page

  }

}