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
  [key: string]: any;
  routesList: any = [];
  selectedRoute: any = '';
  selectedRouteDetails: any;
  activeUsers: any;
  activeDrivers: any;
  activeWastePickers: any;
  activeCount: number = 0;
  totalCount: number = 0;
  cards = [
    { title: 'Users', count: 0, total: 0 },
    { title: 'Drivers', count: 0, total: 0 },
    { title: 'Waste', count: 0, total: 0 }
  ];
  selectedFile: File | null = null;
  uploadMessage: string | null = null;
  uploadSuccess: boolean = false;

  constructor(private http: HttpClient, private app: AppComponent) {
    this.loadDriverAndUserData('monthly');
    this.getAllRoutes();
    this.fetchActiveData('Users');
    this.fetchActiveData('Drivers');
    this.fetchActiveData('Waste');
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadMessage = null; // Reset message
    }
  }

  // Upload file
  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadMessage = 'No file selected!';
      this.uploadSuccess = false;
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    const uploadUrl = 'http://localhost:8080/api/uploadOldData'; // Backend API endpoint

    this.http.post(uploadUrl, formData, { responseType: 'text' }).subscribe({
      next: (response: string) => {
        this.uploadMessage = response;
        this.uploadSuccess = true;
      },
      error: (error) => {
        this.uploadMessage = `Upload failed`;
        this.uploadSuccess = false;
      }
    });
  }


  // Generic function to fetch active data
  fetchActiveData(type: string): void {
    const url = `${this.app.baseUrl}active${type}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        // Update the active and total counts dynamically
        this[`active${type}`] = data;

        const card = this.cards.find(card => card.title === type);
        if (card) {
          card.count = data[1]; // Active count
          card.total = data[0]; // Total count
        } else {
          console.warn(`Card with title "${type}" not found`);
        }
      },
      error: (err) => {
        console.error(`Error fetching active${type} data`, err);
      }
    });
  }

  getAllRoutes() {
    const url = `${this.app.baseUrl}getAllRoutes`;
    this.http.get(url).subscribe({
      next: (data: any) => {
        this.routesList = data;
      },
      error: (err) => console.error('Error fetching data', err)
    });
  }

  showRouteDetails() {
    const route = this.routesList.find((r: any) => r.routeId === this.selectedRoute);
    if (route) {
      this.selectedRouteDetails = route;
    } else {
      console.error('Route not found!');
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  generateReport(route: any) {
    if (!this.selectedDate) {
      alert('Please select a date!');
      return;
    }

    const formattedDate = this.formatDate(this.selectedDate);
    const url = `${this.app.baseUrl}getDailyDataOfUsers?date=${encodeURIComponent(formattedDate)}&routeId=${encodeURIComponent(route.routeId)}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          alert('No data available for the selected date!');
          return;
        }

        // Collect all unique donation types and initialize data structure
        const donationTypes = new Set<string>();
        const dataRows = data.map((item: any) => {
          const weights: { [type: string]: number } = {};
          if (item.userName) {
            const entries = item.userName.split(';'); // Assuming multiple types are separated by ";"
            entries.forEach((entry: string) => {
              const [type, weight] = entry.split('@');
              if (type && weight) {
                donationTypes.add(type);
                weights[type] = parseFloat(weight) || 0;
              }
            });
          }

          return {
            address: item.address || 'N/A',
            area: item.area || 'N/A',
            contact: item.contact || 'N/A',
            date: item.date || 'N/A',
            dry: item.dry || 0,
            wet: item.wet || 0,
            uid: item.uid || 'N/A',
            user: item.user || 'N/A',
            weights,
          };
        });

        // Create dynamic headers
        const baseHeaders = ['Date', 'User', 'Contact', 'Address', 'Area', 'UID', 'Dry Waste (kg)', 'Wet Waste (kg)'];
        const dynamicHeaders = Array.from(donationTypes);
        const headerRow = [...baseHeaders, ...dynamicHeaders];

        // Prepare rows for the report
        const reportRows = dataRows.map((row: { date: any; user: any; contact: any; address: any; area: any; uid: any; dry: any; wet: any; weights: { [x: string]: any; }; }) => {
          const rowData = [
            row.date,
            row.user,
            row.contact,
            row.address,
            row.area,
            row.uid,
            row.dry,
            row.wet,
            ...dynamicHeaders.map((type) => row.weights[type] || 0),
          ];
          return rowData;
        });

        // Include Route ID as a header
        const headerRoute = [`Route : ${route.startingPoint} to ${route.endingPoint}`];

        // Combine all rows into the final report
        const reportData = [headerRoute, [], headerRow, ...reportRows];

        // Trigger the download
        this.downloadReport(reportData, `Report_${route.startingPoint}_To_${route.endingPoint}_${formattedDate}.xlsx`);
      },
      error: (err) => {
        console.error('Error fetching data', err);
        alert('An error occurred while fetching data. Please try again later.');
      },
    });
  }

  downloadReport(data: any[], filename: string) {
    const sanitizedData = data.map(row =>
      row.map((cell: any) => (cell !== null && cell !== undefined) ? cell.toString() : '')
    );
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sanitizedData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
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
        console.log(driverData);
        
        const groupedData = this.groupDataById(driverData);
        this.driverPieChart = this.createPieChart(groupedData, 'Driver Data');
      },
      error: (err) => console.error('Error fetching driver data:', err)
    });

    this.http.get(userUrl).subscribe({
      next: (userData: any) => { console.log(userData);
        const groupedData = this.groupDataById(userData);
        this.userPieChart = this.createPieChart(groupedData, 'User Data');
      },
      error: (err) => console.error('Error fetching user data:', err)
    });

    this.http.get(wastePickerUrl).subscribe({
      next: (wastePickerData: any) => { console.log(wastePickerData);
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
      accessibility: {
        enabled: false,
      },
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
