import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AssessmentQuestion {
    questionNo: number;
    question: string;
    englishQuestion: string;
    marks: number;

}

export interface Assessment {

    _id?: string;
    class: any;
    title: string;
    topic: string;
    level: string;
    language: string;
    instructions: string;
    totalMarks: number;
    questions: AssessmentQuestion[];
    generatedBy?: string;
    createdAt?: string;

}

@Injectable({
  providedIn: 'root'
})

export class AssessmentService {

    private apiUrl = `${environment.apiUrl}/assessments`;

    constructor(private http: HttpClient) {}

    // =====================================
    // Get All Assessments
    // =====================================

    getAllAssessments(): Observable<Assessment[]> {

        return this.http.get<Assessment[]>(
        this.apiUrl,
        {
            withCredentials: true
        }
        );

    }

    // =====================================
    // Get Assessment By ID
    // =====================================

    getAssessmentById(id: string): Observable<Assessment> {

        return this.http.get<Assessment>(
            `${this.apiUrl}/${id}`,
            {
            withCredentials: true
            }
        );

    }

    // =====================================
    // Get Student Assessments
    // =====================================

    getStudentAssessments(): Observable<any[]> {

        return this.http.get<any[]>(
        `${this.apiUrl}/student`,
        {
            withCredentials: true
        }
        );

    }

}