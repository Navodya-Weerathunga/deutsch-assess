// src/app/services/answer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  private apiUrl =
    `${environment.apiUrl}/answers`;


  constructor(
    private http: HttpClient
  ) {}


  // =====================================
  // Upload Student Answers
  // =====================================

  uploadAnswers(
    assessmentId: string,
    file: File
  ): Observable<any> {

    const formData =
      new FormData();


    formData.append(
      'assessmentId',
      assessmentId
    );


    formData.append(
      'answerFile',
      file
    );


    return this.http.post<any>(
      this.apiUrl,
      formData,
      {
        withCredentials: true
      }
    );

  }

  // =====================================
  // Get Answer Result
  // =====================================

  getAnswerResult(answerId: string): Observable<any> {

      return this.http.get<any>(
          `${this.apiUrl}/${answerId}`,
          {
              withCredentials: true
          }
      );

  }

}