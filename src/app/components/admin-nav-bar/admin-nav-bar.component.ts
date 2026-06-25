import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

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

}