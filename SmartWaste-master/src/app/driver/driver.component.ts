import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { DriverService } from '../service/driver.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {
  driversList: any = [];

  constructor(private app: AppComponent, private driverService: DriverService) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers() {
    const url = `${this.app.baseUrl}getAllDrivers`;
    this.driverService.getDrivers(url).subscribe((data: any) => {
      this.driversList = data;
      this.driverService.setDrivers(data);
    });
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.driversList);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drivers');

    // Generate the Excel file and prompt download
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'DriversListData.xlsx');
  }
}
