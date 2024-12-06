import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChartModule } from 'angular-highcharts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DriverComponent } from './driver/driver.component';
import { UserComponent } from './user/user.component';
import { WastepickerComponent } from './wastepicker/wastepicker.component';
import { NewrouteComponent } from './newroute/newroute.component';
import { ComplaintsComponent } from './dashboard/complaints/complaints.component';
import { UserPieChartComponent } from './user/user-pie-chart/user-pie-chart.component';
import { DriverPieChartComponent } from './driver/driver-pie-chart/driver-pie-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { WastepickerPieChartComponent } from './wastepicker/wastepicker-pie-chart/wastepicker-pie-chart.component';
import { NewAreaComponent } from './user/new-area/new-area.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { matFormFieldAnimations } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {ChangeDetectionStrategy, Component} from '@angular/core';
 import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { DonationComponent } from './dashboard/donation/donation.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DriverComponent,
    UserComponent,
    WastepickerComponent,
    NewrouteComponent,
    ComplaintsComponent,
    UserPieChartComponent,
    DriverPieChartComponent,
    WastepickerPieChartComponent,
    NewAreaComponent,
    DonationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,MatFormFieldModule, MatInputModule, MatDatepickerModule,
    FormsModule,MatNativeDateModule,
    HighchartsChartModule,
    ReactiveFormsModule,
    ChartModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
