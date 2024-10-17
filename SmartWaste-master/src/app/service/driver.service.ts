
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private driversList: any[] = [];
  constructor(private http: HttpClient) { }
  getDrivers(url: string): Observable<any> {

    if (this.driversList.length === 0) {
      return this.http.get(url);
    } else {
      return new Observable(observer => {
        observer.next(this.driversList);
        observer.complete();
      });
    }
  }
  setDrivers(drivers: any[]) {
    this.driversList = drivers;
  }
}
