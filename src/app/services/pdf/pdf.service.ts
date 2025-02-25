import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  private apiUrl = environment.serverUrl + "api/pdf";

  constructor(private http: HttpClient) { }

  postPdfData(id: number, json: string): Observable<any> {
    // Build the URL with the id parameter.
    const url = `${this.apiUrl}/${id}`;
    return this.http.post<any>(url, json, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
