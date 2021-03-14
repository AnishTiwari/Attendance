import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseService } from '../../app.service';
import {Students} from './models/students';
import {AttendanceComponent} from '../attendance/attendance.component';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  constructor(private _activatedRoute:ActivatedRoute, private _baseservice:BaseService, private matsnackbar:MatSnackBar, private matdialog:MatDialog ) { }
public courseCode:string;
public Students:Students = new Students();
  ngOnInit(): void {

    this.courseCode = this._activatedRoute.snapshot.parent.paramMap.get('id');

    this._baseservice.getAll("course/getstudents/"+this.courseCode)
    .subscribe(
      (data)=>{   Object.assign(this.Students, data); 
        console.log(data);
         return this.Students;}
    , (error) => {
              this.matsnackbar.open(error.message, "error", {
                duration: 4000,
              });
            }
    )
  }


  viewStudentAttendance(rollno:string)  {
    this._baseservice.getAll("course/getStudentAttendance/"+this.courseCode+"/"+rollno )
    .subscribe(
      (data)=>{
        this.matdialog.open(AttendanceComponent,{width:'100%', data:{attendance:data}});
        console.log(data);
      }
      ,
      (error)=>{
        this.matsnackbar.open(error.message, "error", {
          duration: 4000,
        });
      }
    )
  }

}
