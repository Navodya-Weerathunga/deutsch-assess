import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-student-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './student-side-bar.component.html',
  styleUrl: './student-side-bar.component.css'
})
export class StudentNavbarComponent {

  constructor(
    private userService: UserService
  ) {}

  // =====================================
  // Logout
  // =====================================

  logout(): void {

    this.userService.logout().subscribe({

      next: () => {

        window.location.href = '/login';

      },

      error: (err) => {

        console.error('Logout failed:', err);

      }

    });

  }

}