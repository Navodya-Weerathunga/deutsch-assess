import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";


@Component({
    selector: 'app-tutor-side-bar',
    templateUrl: './tutor-side-bar.component.html',
    styleUrls: ['./tutor-side-bar.component.css'],
    imports: [MatIcon]
})
export class TutorSideBarComponent {

    constructor(
        private router: Router
    ) {}


    // =====================================
    // Logout
    // =====================================

    logout(): void {

        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Navigate to login
        this.router.navigate(['/login']);

    }

}