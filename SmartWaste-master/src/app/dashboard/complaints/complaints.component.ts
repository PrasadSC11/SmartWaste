import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit {
  complaints: any[] = []; // Combined complaints array
  @Input() toggle1: any;

  constructor(private http: HttpClient, private app: AppComponent) {}

  ngOnInit(): void {
    if (this.toggle1) {
      this.loadComplaints();
    }
  }

  loadComplaints() {
    let url = '';
    if (this.toggle1 == 5) {
      url = `${this.app.baseUrl}getDriverComplaints`;
    } else if (this.toggle1 == 6) {
      url = `${this.app.baseUrl}getWastePickerComplaints`;
    } else if (this.toggle1 == 7) {
      url = `${this.app.baseUrl}getUserComplaints`;
    }

    this.http.get(url).subscribe((data: any) => {
      this.complaints = data.map((complaint: any) => ({
        ...complaint,
        formattedTime: this.formatTime(complaint.time)
      }));
    });
  }

  formatTime(timeString: string): string {
    const [datePart, timePart] = timeString.split(' ');
    const [day, month, year] = datePart.split('/');
    const formattedDate = `${year}-${month}-${day}T${timePart}+05:30`;
    return new Date(formattedDate).toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }
}
