import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendSms(to: string, from: string, profileId: string, message: string): Observable<any> {
    const payload = {
      from: from,
      messaging_profile_id: profileId, 
      to: to,
      text: message,
      webhook_url:  null,//'https://mysite.com/7420/updates',
      webhook_failover_url: null, //'https://mysite.com/7420/backup/updates',
      use_profile_webhooks: true,
      type: "MMS",
      subject: "From GitaiT",
      media_urls :[],
    };

    return this.http.post(this.apiUrl, payload);
  }
}
