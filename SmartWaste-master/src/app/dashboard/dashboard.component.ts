import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  driverPieChart: Chart = new Chart({});
  userPieChart: Chart = new Chart({});
  wastePickerChart: Chart = new Chart({});
  colorMapping: any = {};

  constructor(private http: HttpClient, private app: AppComponent) {
    this.loadDriverAndUserData("monthly");
  }
  switchData(viewType: string) {
    this.loadDriverAndUserData(viewType);
  }
  loadDriverAndUserData(viewType: string) {
    const driverUrl = `${this.app.baseUrl}getDriverDailyData/${viewType}`;
    const userUrl = `${this.app.baseUrl}getUsersDailyData/${viewType}`;
    const wastePickerUrl = `${this.app.baseUrl}getWastePickersDailyData/${viewType}`;

    this.http.get(driverUrl).subscribe({
      next: (driverData: any) => {
        const driverWasteData = this.groupDataById(driverData);
        this.driverPieChart = this.createPieChart(driverWasteData, `Drivers`);
      },
      error: (err) => console.error('Error fetching driver data', err)
    });

    this.http.get(userUrl).subscribe({
      next: (userData: any) => {
        const userWasteData = this.groupDataById(userData);
        this.userPieChart = this.createPieChart(userWasteData, `Users`);
      },
      error: (err) => console.error('Error fetching user data', err)
    });

    this.http.get(wastePickerUrl).subscribe({
      next: (wastePickerData: any) => {
        const wastePickerChart = this.groupDataById(wastePickerData);
        this.wastePickerChart = this.createPieChart(wastePickerChart, `WastePickers`);
      },
      error: (err) => console.error('Error fetching waste picker data', err)
    });
  }
  groupDataById(data: any[]) {
    const result: any = {};
    data.forEach(item => {
      const id = item.userName;
      if (!result[id]) {
        result[id] = { dryTotal: 0, wetTotal: 0 };
        this.colorMapping[id] = this.getRandomColor();
      }
      result[id].dryTotal += item.dry;
      result[id].wetTotal += item.wet;
    });
    return result;
  }

  createPieChart(dataById: any, title: string): Chart {
    const chartData = Object.keys(dataById).flatMap(id => [
      { name: `${id} - Dry`, y: dataById[id].dryTotal, color: this.colorMapping[id] },
      { name: `${id} - Wet`, y: dataById[id].wetTotal, color: this.colorMapping[id] }
    ]);

    return new Chart({
      chart: {
        type: 'pie',
        // plotShadow: false,
        // height: '15%',
      },
      // credits: {
      //   enabled: false,
      // },
      // plotOptions: {
      //   pie: {
      //     innerSize: '90%',
      //     borderWidth: 2,
      //     dataLabels: {
      //       format: '{point.name}',
      //       distance: 1,
      //       style: {
      //         fontSize: '12px'
      //       }
      //     },
      //   },
      // },
      title: {
        text: title,
        // align: 'center',
        // verticalAlign: 'middle',
        // floating: true,
        // style: {
        //   fontSize: '16px',
        //   color: '#000',
        // },
      },
      // legend: {
      //   enabled: false,
      // },

      credits: {
        enabled: false
      },
      series: [{
        type: 'pie',
        name: 'Total',
        data: chartData,
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            plotOptions: {
              pie: {
                innerSize: '90%',
                borderWidth: 2,
              }
            }
          }
        }]
      }
    });
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
