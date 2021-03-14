import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

import {Attendances} from './models/attendance.model';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  public Attendances:Attendances = new Attendances();

  constructor(@Inject(MAT_DIALOG_DATA) attendanceData) {
    Object.assign(this.Attendances , attendanceData);
    console.log(this.Attendances);
    
    this.Attendances.attendance.data.map(x=>x.logged_time =  new Date(x.logged_time));
  }


  ngOnInit(): void {
  }

}
