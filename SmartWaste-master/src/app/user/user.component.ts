import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface User {
  rf_id: string;
  area: string;
  username: string;
  email: string;
  contact: string;
  address1: string;
  address2: string;
  pincode: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userlist: User[] = [];
  selectedUser: User | null = null;

  constructor(
    private http: HttpClient,
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const url = `${this.app.baseUrl}getAllUsers`;
    this.http.get<User[]>(url).subscribe((data: User[]) => {
      this.userlist = data;
    });
  }
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.userlist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate the Excel file and prompt download
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'UsersListData.xlsx');
  }
}
