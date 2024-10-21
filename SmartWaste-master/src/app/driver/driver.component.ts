import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { DriverService } from '../service/driver.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {
  driversList: any = [];

  constructor(
    private app: AppComponent, private driverService: DriverService) {
  }

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
}