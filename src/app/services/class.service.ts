import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Class {
  _id?: string;
  topic: string;
  classDate: string;
  startTime: string;
  endTime: string;
  batch: string;
  medium: string;
  level: string;
  tutor: string;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomStartUrl?: string;
}

export interface Tutor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  regNo: string;
  medium: string[];
  batch: string[];
  assignedCourses: string[];
}

@Injectable({
  providedIn: 'root'
})

export class ClassService {

  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) { }

  // =====================================
  // Get Available Tutors
  // =====================================

  getAvailableTutors(
    medium: string,
    level: string,
    batch: string
  ): Observable<Tutor[]> {
    const params = new HttpParams()
      .set('medium', medium)
      .set('assignedCourses', level)
      .set('batch', batch);
    return this.http.get<Tutor[]>(
      `${this.apiUrl}/available-tutors`,
      {
        params,
        withCredentials: true
      }
    );

  }

  // =====================================
  // Create Zoom Meeting
  // =====================================

  createClass(classData: Class): Observable<any> {

    return this.http.post(

      `${this.apiUrl}/create`,

      classData,

      {

        withCredentials: true

      }

    );

  }

  // =====================================
  // Get All Classes
  // =====================================

  getAllClasses(): Observable<Class[]> {

    return this.http.get<Class[]>(

      `${this.apiUrl}`,

      {

        withCredentials: true

      }

    );

  }

    // =====================================
    // Upload Transcript
    // =====================================

    uploadTranscript(
    classId: string,
    transcriptFile: File
    ): Observable<any> {

    const formData = new FormData();

    formData.append("transcript", transcriptFile);

    return this.http.post(

        `${this.apiUrl}/${classId}/upload-transcript`,

        formData,

        {
        withCredentials: true
        }

    );

    }

    // Generate Assessment

    generateAssessment(classId: string): Observable<any> {

        return this.http.post(

            `${this.apiUrl}/${classId}/generate-assessment`,

            {},

            {

            withCredentials: true

            }

        );

    }


}