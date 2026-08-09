import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

    regNo: string = '';
    password: string = '';

    hidePassword: boolean = true;

    isLoading = false;
    errorMessage = '';

    constructor(
        private userService: UserService,
        private router: Router
    ) {}

      login(): void {

    this.errorMessage = '';

    if (!this.regNo.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter your Web App ID and Password.';
      return;
    }

    this.isLoading = true;

    this.userService.login({
      regNo: this.regNo,
      password: this.password
    }).subscribe({

      next: (response) => {

        this.isLoading = false;

        const user = response.user;

        switch (user.role) {

          case 'ADMIN':
            this.router.navigate(['/student-list']);
            break;

          case 'TUTOR':
            alert('Login successful! Welcome, ' + user.firstName + ' ' + user.lastName + '.');
            // this.router.navigate(['/tutor-dashboard']);
            break;

          case 'STUDENT':
            this.router.navigate(['/student-dashboard']);
            break;

          default:
            this.router.navigate(['/home']);
        }

      },

      error: (err) => {

        this.isLoading = false;

        this.errorMessage =
          err.error?.msg || 'Invalid Web App ID or Password.';

      }

    });

  }

}