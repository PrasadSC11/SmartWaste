import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WastePickerService {
  private wastePickersList: any[] = [];

  constructor(private http: HttpClient) { }
  getWastePickers(url: string): Observable<any> {
    if (this.wastePickersList.length === 0) {
      return this.http.get<any[]>(url);
    } else {
      return new Observable(observer => {
        observer.next(this.wastePickersList);
        observer.complete();
      });
    }
  }
  setWastePickers(wastePickers: any[]) {
    this.wastePickersList = wastePickers;
  }
  getCachedWastePickers() {
    return this.wastePickersList;
  }
}
