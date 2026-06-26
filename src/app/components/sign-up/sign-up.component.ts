import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;

  isLoading = false;

  tutors: any[] = [];

  mediums = [
    'Sinhala',
    'English',
    'Tamil'
  ];

  courses = [
    'A1',
    'A2',
    'B1',
    'B2'
  ];

  selectedMediums: string[] = [];

  selectedCourses: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.signupForm = this.fb.group({

      role: ['STUDENT', Validators.required],

      firstName: ['', Validators.required],

      lastName: ['', Validators.required],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      medium: [[]],

      batch: [''],

      plan: ['PLATINUM'],

      status: ['ONGOING'],

      assignedCourses: [[]],

      tutorIncharged: ['']

    });

    this.signupForm.get('role')?.valueChanges.subscribe(() => {

      this.updateValidators();

    });

  }

  //-----------------------------------------
  // Dynamic Visibility
  //-----------------------------------------

  get isStudent(): boolean {

    return this.signupForm.get('role')?.value === 'STUDENT';

  }

  get isStudentOrTutor(): boolean {

    const role = this.signupForm.get('role')?.value;

    return role === 'STUDENT' || role === 'TUTOR';

  }

  //-----------------------------------------
  // Medium Checkbox
  //-----------------------------------------

  onMediumChange(event: MatCheckboxChange, medium: string): void {

    if (event.checked) {

      this.selectedMediums.push(medium);

    } else {

      this.selectedMediums =
        this.selectedMediums.filter(m => m !== medium);

    }

    this.signupForm.patchValue({

      medium: this.selectedMediums

    });

    this.loadTutors();

  }

  //-----------------------------------------
  // Course Checkbox
  //-----------------------------------------

  onCourseChange(event: MatCheckboxChange, course: string): void {

    if (event.checked) {

      this.selectedCourses.push(course);

    }

    else {

      this.selectedCourses =
        this.selectedCourses.filter(c => c !== course);

    }

    this.signupForm.patchValue({

      assignedCourses: this.selectedCourses

    });

    this.loadTutors();

  }

  //-----------------------------------------
  // Load Tutors
  //-----------------------------------------

  loadTutors(): void {

    if (!this.isStudent) {

      return;

    }

    if (this.selectedMediums.length === 0) {

      this.tutors = [];

      return;

    }

    this.userService
      .getAvailableTutors(this.selectedMediums, this.selectedCourses, this.signupForm.value.batch ? [this.signupForm.value.batch] : [])
      .subscribe({

        next: (response: any) => {

          this.tutors = response;

        },

        error: err => {

          console.error(err);

        }

      });

  }

  //-----------------------------------------
  // Validators
  //-----------------------------------------

  updateValidators(): void {

    const role = this.signupForm.value.role;

    if (role === 'ADMIN') {

      this.signupForm.patchValue({

        medium: [],
        batch: '',
        plan: '',
        status: '',
        assignedCourses: [],
        tutorIncharged: ''

      });

    }

  }

  //-----------------------------------------
  // Register
  //-----------------------------------------

  registerUser(): void {

    if (this.signupForm.invalid) {

      this.signupForm.markAllAsTouched();

      return;

    }

    this.isLoading = true;

    const formValue = {

      ...this.signupForm.value,

      batch: this.signupForm.value.batch
        ? this.signupForm.value.batch
            .split(',')
            .map((b: string) => b.trim())
        : []

    };

    this.userService.signup(formValue).subscribe({

      next: () => {

        this.isLoading = false;

        alert('User registered successfully.');

        this.router.navigate(['/admin/students']);

      },

      error: err => {

        this.isLoading = false;

        alert(err.error?.msg || 'Registration failed.');

      }

    });

  }

}