import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  dataForExport: any = {};
  selectedDataType: string = 'user'; // Default value
  constructor(private http: HttpClient, private app: AppComponent) {
    this.loadDriverAndUserData("monthly");
  }
  generateReport(datas: string) {
    let url = '';
    const viewType = '2months'; // Modify this as needed

    if (datas === 'user') {
      url = `${this.app.baseUrl}getUsersDailyData/${viewType}`;
    } else if (datas === 'driver') {
      url = `${this.app.baseUrl}getDriverDailyData/${viewType}`;
    } else if (datas === 'wastePicker') {
      url = `${this.app.baseUrl}getWastePickersDailyData/${viewType}`;
    }

    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log(data);

        // Group data by userName
        const groupedData: { [key: string]: any[] } = data.reduce((acc: any, item: any) => {
          const userName = item.userName.split('@')[0];
          if (!acc[userName]) {
            acc[userName] = [];
          }
          acc[userName].push(item);
          return acc;
        }, {});

        // Prepare the data with separate sections for each user
        const dataForExport: any[] = [];

        Object.keys(groupedData).forEach((userName, index) => {
          // Add a header row for the user
          const userHeader = [`Name: ${userName}`];
          dataForExport.push(userHeader);

          // Add column headers
          const columnHeaders = ['Sr.No', 'User Name', 'User Id', 'Date', 'Dry Total', 'Wet Total'];
          dataForExport.push(columnHeaders);

          // Add the user's data rows
          const userData = groupedData[userName].map((item, idx) => [
            idx + 1,                     // 'Index'
            userName,                    // 'User Name'
            item.userName.split('@')[1], // 'User Id'
            item.date,                   // 'Date'
            item.dry,                    // 'Dry Total'
            item.wet                     // 'Wet Total'
          ]);
          dataForExport.push(...userData);

          // Add an empty row for spacing between users
          if (index < Object.keys(groupedData).length - 1) {
            dataForExport.push([]);
          }
        });

        this.dataForExport = dataForExport;

        // Pass processed data to downloadReport
        this.downloadReport(dataForExport, `${datas}_report.xlsx`);
      },
      error: (err) => console.error('Error fetching data', err)
    });
  }

  downloadReport(data: any[], filename: string) {
    // Create the worksheet with headers starting from the second row
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Write workbook to buffer and create a Blob
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // Trigger the download
    saveAs(blob, filename);
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
        this.driverPieChart = this.createPieChart(driverWasteData, `Driver Data`);
      },
      error: (err) => console.error('Error fetching driver data', err)
    });

    this.http.get(userUrl).subscribe({
      next: (userData: any) => {
        const userWasteData = this.groupDataById(userData);
        this.userPieChart = this.createPieChart(userWasteData, `User Data`);
      },
      error: (err) => console.error('Error fetching user data', err)
    });

    this.http.get(wastePickerUrl).subscribe({
      next: (wastePickerData: any) => {
        const wastePickerChart = this.groupDataById(wastePickerData);
        this.wastePickerChart = this.createPieChart(wastePickerChart, `WastePicker Data`);
      },
      error: (err) => console.error('Error fetching waste picker data', err)
    });
  }
  groupDataById(data: any[]) {
    const result: any = {};
    data.forEach(item => {
      const id = item.userName.split("@")[0];
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
      plotOptions: {
        pie: {
          //     innerSize: '90%',
          //     borderWidth: 2,
          dataLabels: {
            //       format: '{point.name}',
            distance: 5,
            //       style: {
            //         fontSize: '12px'
          }
        },
      },
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
