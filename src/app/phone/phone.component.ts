import { Component } from '@angular/core';
import { DialPadComponent } from '../dial-pad/dial-pad.component';

@Component({
  selector: 'app-phone',
  imports: [DialPadComponent],
  templateUrl: './phone.component.html',
  styleUrl: './phone.component.css'
})
export class PhoneComponent {

}
