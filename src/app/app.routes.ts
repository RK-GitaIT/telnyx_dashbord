import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SettingsComponent } from './settings/settings.component';
import { SendmsgComponent } from './sendmsg/sendmsg.component';
import { DialPadComponent } from './dial-pad/dial-pad.component';
import { IvrcallComponent } from './ivrcall/ivrcall.component';
import { QrcodegeneratorComponent } from './component/qrcodegenerator/qrcodegenerator.component';
import { MedicalformComponent } from './component/pdf/medicalform/medicalform.component';

export const routes: Routes = [
  { path: 'messages', component: MessagesComponent },
  { path: 'sendmsg', component: SendmsgComponent },
  { path: 'phone', component: DialPadComponent },
  { path: 'ivr', component: IvrcallComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'settings', component: SettingsComponent },
  {path: 'qrgenerator', component: QrcodegeneratorComponent},
  {path: 'pdf-forms', component: MedicalformComponent},
  { path: '', redirectTo: '/messages', pathMatch: 'full' } 
];
