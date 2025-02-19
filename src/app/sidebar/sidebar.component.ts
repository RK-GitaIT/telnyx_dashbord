import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  profileName: string = 'User'; // Default value

  constructor(private profileService: ProfileService) {}

  ngOnInit() {

    this.profileService.selectedProfile$.subscribe(profile => {
      if (profile) {
        this.profileName = profile.name; 
      }
    });
  }
}
