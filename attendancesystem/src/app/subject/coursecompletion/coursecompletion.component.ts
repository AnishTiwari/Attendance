import { BaseService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DigitalSignatures } from './professordigisign/models/digitalsign.models';
import { CourseCompletion } from './models/coursecompletion';
import { ProfessordigisignComponent } from './professordigisign/professordigisign.component'
@Component({
  selector: 'app-coursecompletion',
  templateUrl: './coursecompletion.component.html',
  styleUrls: ['./coursecompletion.component.css']
})
export class CoursecompletionComponent implements OnInit {

  constructor(private BaseService: BaseService,  private activatedRoute: ActivatedRoute,private matsnackbar: MatSnackBar, private matdialog: MatDialog) { }
  public course_code: string;
  
      public coursecompletion: CourseCompletion = new CourseCompletion();

  ngOnInit(): void {
    this.course_code = this.activatedRoute.parent.snapshot.paramMap.get('id');
    console.log(this.course_code);
    this.BaseService.getAll("course/coursecompletion/" + this.course_code)
      .subscribe((data)=>{
	        Object.assign(this.coursecompletion, data);
	console.log(this.coursecompletion);
      },
        (error) => {
          this.matsnackbar.open(error.message, "error", {
            duration: 4000,
          });
        }
      );
  }


  public issuecertificate(rollno:string){
    console.log(rollno);

  }
  
 public viewProfessorDigitalSignature()  {
    this.BaseService.getAll("course/getprofessordigitalsignature/")
    .subscribe(
      (data)=>{
        this.matdialog.open(ProfessordigisignComponent,{width:'100%', data:{DigitalSignatures:data}});
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

