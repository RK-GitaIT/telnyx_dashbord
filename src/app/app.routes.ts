import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SettingsComponent } from './settings/settings.component';
import { SendmsgComponent } from './sendmsg/sendmsg.component';
import { DialPadComponent } from './dial-pad/dial-pad.component';

export const routes: Routes = [
  { path: 'messages', component: MessagesComponent },
  { path: 'sendmsg', component: SendmsgComponent },
  { path: 'phone', component: DialPadComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/messages', pathMatch: 'full' } 
];
