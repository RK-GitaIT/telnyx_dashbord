import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-messages',
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent {
  activeTab: string = 'All';

  // Mock Messages Data
  messages = [
    {
      sender: 'Copilot',
      message: 'Media',
      time: '22-01-2025',
      image: 'copilot.png',
    },
    {
      sender: 'Ram Polineni (You)',
      message: 'https://levelup.video/tutorial...',
      time: 'Wed',
      image: null,
    },
    {
      sender: 'Chaitanya',
      message: '??',
      time: '16:41',
      image: null,
    },
    {
      sender: 'Amplify UI/UX',
      message: '@schintala @chaitanya Added...',
      time: '15:11',
      image: 'amplify.png',
    },
    {
      sender: 'Shankar Maraka',
      message: 'Worked on:',
      time: 'Mon',
      image: null,
    },
    {
      sender: 'ATPW',
      message: 'Standup Call Summary...',
      time: 'Mon',
      image: null,
    },
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
