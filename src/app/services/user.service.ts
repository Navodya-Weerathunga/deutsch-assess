// src/app/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {

    _id?: string;
    regNo: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'TUTOR' | 'STUDENT';
    medium?: string[];
    batch?: string[];
    plan?: 'PLATINUM' | 'SILVER';
    status?:
      | 'ONGOING'
      | 'COMPLETED'
      | 'UNCERTAIN'
      | 'WITHDREW';
    tutorIncharged?: string;
    assignedCourses?: string[];
    createdAt?: Date;

}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiUrl = `${environment.apiUrl}/users`;

    private currentUserSubject = new BehaviorSubject<User | null>(null);

    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    // ==========================
    // Signup
    // ==========================

    signup(user: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        medium?: string[];
        batch?: string[];
        plan?: string;
        status?: string;
        tutorIncharged?: string;
        assignedCourses?: string[];
    }): Observable<any> {

        return this.http.post(
        `${this.apiUrl}/signup`,
        user,
        { withCredentials: true }
        );

    }

    // ==========================
    // Login
    // ==========================

    login(credentials: {
        regNo: string;
        password: string;
    }): Observable<any> {

        return this.http.post<any>(
        `${this.apiUrl}/login`,
        credentials,
        { withCredentials: true }
        ).pipe(

        tap(response => {

            if (response.user) {

            this.currentUserSubject.next(response.user);

            }

        })

        );

    }

    // ==========================
    // Logout
    // ==========================

    logout(): Observable<any> {

    return this.http.post(
        `${this.apiUrl}/logout`,
        {},
        { withCredentials: true }
    ).pipe(

        tap(() => {

        this.currentUserSubject.next(null);

        })

    );

    }

    // ==========================
    // Get All Students (Admin only)
    // ==========================

    getAllStudents(): Observable<User[]> {

      return this.http.get<User[]>(`${this.apiUrl}/students`, { withCredentials: true });

    }

    // ==========================
    // User State
    // ==========================

    getCurrentUser(): User | null {

        return this.currentUserSubject.value;

    }

    isLoggedIn(): boolean {

        return this.currentUserSubject.value !== null;

    }

    // ==========================
    // Get Available Tutors
    // ==========================

    getAvailableTutors(
    medium: string[],
    assignedCourses: string[],
    batch: string[]
    ): Observable<User[]> {

    return this.http.get<User[]>(
        `${this.apiUrl}/available-tutors`,
        {
        params: {
            medium: medium,
            assignedCourses: assignedCourses,
            batch: batch
        },
        withCredentials: true
        }
    );

    }

    // ==========================
    // Get All Tutors (Admin only)
    // ==========================

    getAllTutors(): Observable<User[]> {

      return this.http.get<User[]>(`${this.apiUrl}/tutors`, { withCredentials: true }); 

    }

}