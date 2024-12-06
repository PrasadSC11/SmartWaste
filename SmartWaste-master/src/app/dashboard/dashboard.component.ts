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
  dataForExport: any = [];
  selectedDate: Date | null = null;
  selectedDataType: string = 'user';

  constructor(private http: HttpClient, private app: AppComponent) {
    this.loadDriverAndUserData('monthly');
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateReport(dataType: string) {
    if (!this.selectedDate) {
      alert('Please select a date!');
      return;
    }

    const formattedDate = this.formatDate(this.selectedDate);
    let url = '';

    switch (dataType) {
      case 'user':
        url = `${this.app.baseUrl}getUsersDailyData/${formattedDate}`;
        break;
      case 'driver':
        url = `${this.app.baseUrl}getDriverDailyData/${formattedDate}`;
        break;
      case 'wastePicker':
        url = `${this.app.baseUrl}getWastePickersDailyData/${formattedDate}`;
        break;
      default:
        alert('Invalid data type selected!');
        return;
    }
    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log(data);
        const name = data[0]?.userName?.split('@')[1] || 'Unknown';
        const headerRow = [`Name: ${name}`];
        const columnHeaders = ['Sr.No', 'User Name', 'User Id', 'Date', 'Dry Total', 'Wet Total'];
        const dataRows = data.map((item: any, index: number) => [
          index + 1,
          item.userName.split('@')[0],
          name,
          item.date,
          item.dry + "kg",
          item.wet + "kg"
        ]);
        const dataWithHeader = [headerRow, columnHeaders, ...dataRows];
        this.dataForExport = dataWithHeader;
        this.downloadReport(dataWithHeader, `${dataType}_report.xlsx`);
      },
      error: (err) => console.error('Error fetching data', err)
    });
  }
  downloadReport(data: any[], filename: string) {
    // Step 1: Sanitize the data
    const sanitizedData = data.map(row =>
      row.map((cell: { toString: () => any; } | null | undefined) => (cell !== null && cell !== undefined) ? cell.toString() : '')
    );

    // Step 2: Create the worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sanitizedData);

    // Step 3: Explicitly set worksheet properties to avoid protection
    if (ws['!protect']) {
      delete ws['!protect'];
    }

    // Step 4: Create the workbook and append the sheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Step 5: Write workbook to buffer and set correct MIME type
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Step 6: Trigger download
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
        const groupedData = this.groupDataById(driverData);
        this.driverPieChart = this.createPieChart(groupedData, 'Driver Data');
      },
      error: (err) => console.error('Error fetching driver data:', err)
    });

    this.http.get(userUrl).subscribe({
      next: (userData: any) => {
        const groupedData = this.groupDataById(userData);
        this.userPieChart = this.createPieChart(groupedData, 'User Data');
      },
      error: (err) => console.error('Error fetching user data:', err)
    });

    this.http.get(wastePickerUrl).subscribe({
      next: (wastePickerData: any) => {
        const groupedData = this.groupDataById(wastePickerData);
        this.wastePickerChart = this.createPieChart(groupedData, 'Waste Picker Data');
      },
      error: (err) => console.error('Error fetching waste picker data:', err)
    });
  }

  private groupDataById(data: any[]): any {
    const result: any = {};
    data.forEach(item => {
      const id = item.userName.split('@')[0];
      if (!result[id]) {
        result[id] = { dryTotal: 0, wetTotal: 0 };
        this.colorMapping[id] = this.getRandomColor();
      }
      result[id].dryTotal += item.dry;
      result[id].wetTotal += item.wet;
    });
    return result;
  }

  private createPieChart(dataById: any, title: string): Chart {
    const chartData = Object.keys(dataById).flatMap(id => [
      { name: `${id} - Dry`, y: dataById[id].dryTotal, color: this.colorMapping[id] },
      { name: `${id} - Wet`, y: dataById[id].wetTotal, color: this.colorMapping[id] }
    ]);

    return new Chart({
      chart: { type: 'pie' },
      title: { text: title },
      credits: { enabled: false },
      series: [{
        type: 'pie',
        name: 'Total',
        data: chartData
      }],
      responsive: {
        rules: [{
          condition: { maxWidth: 600 },
          chartOptions: {
            plotOptions: {
              pie: { innerSize: '90%' }
            }
          }
        }]
      }
    });
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
