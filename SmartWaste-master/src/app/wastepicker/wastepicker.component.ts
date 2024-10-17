import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { WastePickerService } from '../service/wastepicker.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-wastepicker',
  templateUrl: './wastepicker.component.html',
  styleUrls: ['./wastepicker.component.css']
})
export class WastepickerComponent implements OnInit {
  wastePickersList: any[] = [];
  selectedWastePicker: any = null;
  areaList: any[] = [];
  selectedArea: any = null;
  constructor(
    private http: HttpClient,
    private app: AppComponent,
    private wastePickerService: WastePickerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadWastePickers();

  }
  loadWastePickers(): void {
    const url = `${this.app.baseUrl}getAllWastePickers`;
    this.wastePickerService.getWastePickers(url).subscribe((data) => {
      this.wastePickersList = data;
      this.wastePickerService.setWastePickers(data);
    });
  }
}
