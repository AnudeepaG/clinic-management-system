// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;
  constructor(private http: HttpClient) {}

  getAvailableSlots(doctorId: number, date: string): Observable<any[]> {
    const params = new HttpParams().set('doctorId', doctorId).set('date', date);
    return this.http.get<any[]>(`${this.apiUrl}/slots`, { params });
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book`, data);
  }

  getMyAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  getDoctorAppointments(doctorId: number, date?: string): Observable<any[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}`, { params });
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  cancel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
