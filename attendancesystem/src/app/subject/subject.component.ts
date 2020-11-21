import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, Inject } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { BaseService } from '../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseSchedule } from './home/models/subject';


@Component({
  selector: 'app-subject',
  templateUrl: './subject.component.html',
  styleUrls: ['./subject.component.css']
})
export class SubjectComponent implements OnInit {

  // public courseschedule: CourseSchedule = new CourseSchedule();
  // public id: string;

  // constructor(@Inject(DOCUMENT) document, private BaseService: BaseService, private matsnackbar: MatSnackBar, private activatedRoute: ActivatedRoute, private _router: Router) { }


  // CourseLocationForm: FormGroup;

  ngOnInit() {

  //   this.id = this.activatedRoute.snapshot.paramMap.get('id');
  //   console.log(this.id);

  //   this.BaseService.getAll("course/getCourseSchedule/" + this.id)
  //     .subscribe((data) => {
  //       console.log(data)
  //       Object.assign(this.courseschedule, data);

  //       console.log(this.courseschedule.data.length);

  //       for (let i: number = 0; i < this.courseschedule.data.length; i++) {
  //         let idString: string = this.courseschedule.data[i].day.toString() + this.courseschedule.data[i].period.toString();
  //         document.getElementById(idString).innerHTML = "<img src='assets/images/check.svg' style='height:20px;' >";
  //       }

  //       return this.courseschedule;
  //     },
  //       (error) => {
  //         this.matsnackbar.open(error.message, "error", {
  //           duration: 3000,
  //         });
  //       }
  //     );

  //   this.CourseLocationForm = new FormGroup({
  //     latitude: new FormControl(this.courseschedule.latitude),
  //     longitude: new FormControl(this.courseschedule.longitude),

  //   });


  // }

  // // API to update location of current subject
  // public updateCourseLoc(form: FormGroup): void {
  //   this.CourseLocationForm.addControl('course_code', new FormControl(this.id));
  //   this.CourseLocationForm.patchValue({'latitude':this.courseschedule.latitude, 'longitude': this.courseschedule.longitude})
  //   console.log(form.value);

  //   this.BaseService.addJson<any[]>('course/updateLocation', form.getRawValue())
  //     .subscribe((data: any) => { console.log(data);
  //       this.matsnackbar.open(data.data, "success", {
  //         duration: 3000,
  //       });
  //     },
  //       (error) => {
  //         this.matsnackbar.open(error.message, "error", {
  //           duration: 3000,
  //         });
  //         return Promise.reject('Location error');
  //       })

  // }
  }
}
