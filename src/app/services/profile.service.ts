import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private selectedProfileSubject = new BehaviorSubject<any>({
    profileId: '',
    profileName: '',
    phoneNumber: ''
  });

  selectedProfile$ = this.selectedProfileSubject.asObservable();

  private apiUrl = environment.apiUrl + '/' + 'messaging_profiles';
  
    constructor(private http: HttpClient) {}
  
    getMessagingProfiles(): Observable<any> {
      return this.http.get(this.apiUrl);
    }

    getProfilesAssociatedPhonenumbers(id: string): Observable<any> {
      return this.http.get(this.apiUrl + '/'+ id + '/' + 'phone_numbers');
    }

    setSelectedProfile(profile: any) {
      this.selectedProfileSubject.next(profile);
    }
}
