import { Component } from '@angular/core';

@Component({
  selector: 'app-dial-pad',
  imports: [],
  templateUrl: './dial-pad.component.html',
  styleUrl: './dial-pad.component.css'
})
export class DialPadComponent {
dialedNumber: string = '';

// Append the number to the dialed number
addToDialedNumber(value: string) {
  this.dialedNumber += value;
}

// Clear the entire dialed number
clearAll() {
  this.dialedNumber = '';
}

// Delete the last digit of the dialed number
deleteLastDigit() {
  this.dialedNumber = this.dialedNumber.slice(0, -1);
}

// Simulate a call (just logging the dialed number for now)
makeCall() {
  console.log('Calling:', this.dialedNumber);
}
}
