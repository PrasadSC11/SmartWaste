import { HttpClient } from '@angular/common/http';
import { Component, Input, SimpleChanges, OnChanges, Inject, PLATFORM_ID } from '@angular/core';
import { AppComponent } from '../../app.component';
import { Chart } from 'angular-highcharts';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-wastepicker-pie-chart',
  templateUrl: './wastepicker-pie-chart.component.html',
  styleUrls: ['./wastepicker-pie-chart.component.css']
})
export class WastepickerPieChartComponent implements OnChanges {
  @Input() wastePickersList: any[] = [];
  selectedUser: any | null = null;
  userData: any;
  chart!: Chart;
  searchRfid: string = '';
  validationMessage: string = '';
  selectedArea: any;
  selectedWastePicker: any;
  areaList: any[] = [];

  constructor(private http: HttpClient, private app: AppComponent, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loadUserData();
    this.loadAreas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wastePickersList'] && this.wastePickersList.length > 0) {
      this.selectedUser = this.wastePickersList[0];
    }
  }

  loadUserData() {
    const url = `${this.app.baseUrl}userLiveData`;
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
          text: 'WastePicker Data',
          margin: 1,
        },
        credits: {
          enabled: false,
        },
        series: [{
          type: 'pie',
          name: 'Waste Data',
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

    this.selectedUser = this.wastePickersList.find((user) => user.rf_id === this.searchRfid) || null;

    if (!this.selectedUser) {
      this.validationMessage = 'No user found with the given RFID.';
    }
  }

  async openModal(wastePicker: any): Promise<void> {
    this.selectedWastePicker = wastePicker;
    if (isPlatformBrowser(this.platformId)) {
      const { Modal } = await import('bootstrap');
      const modalElement = document.getElementById('wastePickerModal');
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
    }
  }

  loadAreas(): void {
    const url = `${this.app.baseUrl}getAllAreas`;
    this.http.get(url).subscribe((data: any) => {
      this.areaList = data;
    });
  }

  selectArea(area: any): void {
    this.selectedArea = area;
  }

  assignArea(): void {
    if (this.selectedArea?.area && this.selectedWastePicker) {
      const url = `${this.app.baseUrl}assignArea/${this.selectedWastePicker.uid}`;
      this.http.put(url, this.selectedArea.area).subscribe((data: any) => {
        if (data === 1) {
          this.selectedWastePicker.area = this.selectedArea.area;
        }
      });
    }
  }
}
