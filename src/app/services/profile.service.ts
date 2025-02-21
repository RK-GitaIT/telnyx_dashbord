import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private selectedProfileSubject = new BehaviorSubject<any>(null);
  selectedProfile$ = this.selectedProfileSubject.asObservable();

  private balanceSubject = new BehaviorSubject<number>(0);
  balance$ = this.balanceSubject.asObservable();

  private currencySubject = new BehaviorSubject<string>('USD');
  currency$ = this.currencySubject.asObservable();

  setSelectedProfile(profile: any) {
    this.selectedProfileSubject.next(profile);
  }

  setBalance(balance: number) {
    this.balanceSubject.next(balance);
  }

  setCurrency(currency: string) {
    this.currencySubject.next(currency);
  }

  private apiUrl = `${environment.apiUrl}/messaging_profiles`;

  constructor(private http: HttpClient) {}

  getMessagingProfiles(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getProfilesAssociatedPhonenumbers(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/phone_numbers`);
  }

  getProfileBalance(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/balance`);
  }

  getProfileBalanceAsync() {
    this.getProfileBalance().subscribe(
      (data) => {
        const balance = parseFloat(data.data.balance);
        const currency = data.data.currency;
        this.setBalance(balance);
        this.setCurrency(currency);
      },
      (error) => {
        console.error('Error fetching profile balance', error);
      }
    );
  }
}
