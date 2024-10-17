import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';

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

  @ViewChild('userModal') userModal: any;

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
}
