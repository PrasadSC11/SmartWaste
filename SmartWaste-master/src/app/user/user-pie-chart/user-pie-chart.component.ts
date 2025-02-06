import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { AppComponent } from '../../app.component';

interface User {
  rf_id: string;
  area: string;
  username: string;
  email: string;
  contact: string;
  address1: string;
  uid: string;
  address2: string;
  pincode: string;
}

@Component({
  selector: 'app-user-pie-chart',
  templateUrl: './user-pie-chart.component.html',
  styleUrls: ['./user-pie-chart.component.css']
})
export class UserPieChartComponent implements OnChanges {
  @Input() userlist: User[] = [];
  firstUser: User | undefined;
  selectedUser: User | undefined;
  userData: any;
  searchRfid: string = '';
  validationMessage: string = '';

  chart!: Chart;

  constructor(private http: HttpClient, private app: AppComponent) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userlist'] && this.userlist.length > 0) {
      this.firstUser = this.userlist[0];
      this.selectedUser = this.firstUser;
      this.loadUserData(this.selectedUser.uid, this.selectedUser.rf_id);
    }
  }

  loadUserData(uid: string, rf_id: string) {
    const url = `${this.app.baseUrl}userLiveData/${uid}/${rf_id}`;
    this.http.get(url).subscribe((data) => {
      this.userData = data;
      this.createChart();
    });
  }

  createChart() {
    if (this.userData) {
      this.chart = new Chart({
        chart: {
          type: 'pie',
        },
        title: {
          text: 'User Data',
          margin: 1,
        },
        credits: {
          enabled: false,
        },
        series: [{
          type: 'pie',
          name: 'User Data',
          data: [{
            name: 'Wet Waste',
            y: this.userData.wet,
            color: '#3498db',
          }, {
            name: 'Dry Waste',
            y: this.userData.dry,
            color: '#e74c3c',
          }]
        }]
      });
    }
  }

  searchUser() {
    this.validationMessage = '';

    if (!this.searchRfid) {
      this.validationMessage = 'RFID cannot be empty.';
      return;
    }

    this.selectedUser = this.userlist.find(user => user.rf_id === this.searchRfid) || undefined;
    if (this.selectedUser) {
      this.loadUserData(this.selectedUser.uid, this.selectedUser.rf_id);
    }
    if (!this.selectedUser) {
      this.validationMessage = 'No user found with the given RFID.';
    }
  }
}
