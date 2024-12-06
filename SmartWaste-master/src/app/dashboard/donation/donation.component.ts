import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-donation',
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.css'
})
export class DonationComponent {
  donations: any;
  constructor(private http: HttpClient, private app: AppComponent) {
    this.loadDonations();
  }
  loadDonations() {
    let url = '';
    url = `${this.app.baseUrl}getAllDonations`;
    this.http.get(url).subscribe((data: any) => {
      this.donations = data;
    });
  }
}
