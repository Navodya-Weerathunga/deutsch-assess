import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './admin-nav-bar.component.html',
  styleUrl: './admin-nav-bar.component.css'
})
export class AdminNavbarComponent {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  logout(): void {

    if (!confirm("Are you sure you want to logout?")) {
      return;
    }

    this.userService.logout().subscribe({

      next: () => {

        this.router.navigate(['/']);

      },

      error: (err) => {

        console.error(err);

        alert("Logout failed.");

      }

    });

  }

}