import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';
import { PhoneComponent } from './phone/phone.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SettingsComponent } from './settings/settings.component';
import { SendmsgComponent } from './sendmsg/sendmsg.component';

export const routes: Routes = [
  { path: 'messages', component: MessagesComponent },
  { path: 'sendmsg', component: SendmsgComponent },
  { path: 'phone', component: PhoneComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/messages', pathMatch: 'full' } 
];
