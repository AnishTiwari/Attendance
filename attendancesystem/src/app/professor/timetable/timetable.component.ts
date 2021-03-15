import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import {CourseSchedule} from '../models/dashboard'
@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit {

  public timetable:CourseSchedule = new CourseSchedule();
  constructor(@Inject(MAT_DIALOG_DATA) _timetable:CourseSchedule) {
    Object.assign(this.timetable , _timetable);
  }

  ngOnInit(): void {
    console.log(this.timetable);
    for (let i: number = 0; i < this.timetable.data.length; i++) {
      let idString: string = this.timetable.data[i].day.toString() + this.timetable.data[i].period.toString();
      document.getElementById(idString).innerHTML = `<img src='assets/images/check.svg' style='height:20px; cursor:pointer;' title="Course Code: ${this.timetable.data[i].course_code}
      Time : ${this.timetable.data[i].start_time} - ${this.timetable.data[i].end_time}" >`;
    }
  }
 
}
