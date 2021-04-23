import { AfterViewInit, Component, ViewChild, OnInit, Inject } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { BaseService } from '../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer} from '@angular/platform-browser';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseSchedule, timeCourse } from './models/subject';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public courseschedule: CourseSchedule = new CourseSchedule();
  public timeCourse: timeCourse = new timeCourse();
  public id: string;
  public day_period;
  constructor(@Inject(DOCUMENT) document,private sanitizer: DomSanitizer, private BaseService: BaseService, private matsnackbar: MatSnackBar, private activatedRoute: ActivatedRoute, private _router: Router) { }
public start_time:string;
public end_time:string;
  public certificateUrl: any;
  CourseLocationForm: FormGroup;
  TimeCourseForm: FormGroup;
  ngOnInit() {

    this.id = this.activatedRoute.parent.snapshot.paramMap.get('id');
    console.log(this.id);

    this.BaseService.getAll("course/getCourseSchedule/" + this.id)
      .subscribe((data) => {
        console.log(data)
        Object.assign(this.courseschedule, data);

        console.log(this.courseschedule.data.length);

        for (let i: number = 0; i < this.courseschedule.data.length; i++) {
          let idString: string = this.courseschedule.data[i].day.toString() + this.courseschedule.data[i].period.toString();
          document.getElementById(idString).innerHTML = "<img src='assets/images/check.svg' style='height:20px; cursor:pointer;' >";
        }
this.certificateUrl = this.sanitizer.bypassSecurityTrustResourceUrl("data:application/pdf;base64,"+ this.courseschedule.certificate);
        return this.courseschedule;
      },
        (error) => {
          this.matsnackbar.open(error.message, "error", {
            duration: 3000,
          });
        }
      );

    this.CourseLocationForm = new FormGroup({
      latitude: new FormControl(this.courseschedule.latitude),
      longitude: new FormControl(this.courseschedule.longitude),

    });

    this.TimeCourseForm = new FormGroup({
      start_time: new FormControl(''),
      end_time: new FormControl(''),
day_period: new FormControl('')
    });
  }

  // API to update location of current subject
  public updateCourseLoc(form: FormGroup): void {
    this.CourseLocationForm.addControl('course_code', new FormControl(this.id));
    this.CourseLocationForm.patchValue({'latitude':this.courseschedule.latitude, 'longitude': this.courseschedule.longitude})
    console.log(form.value);

    this.BaseService.addJson<any[]>('course/updateLocation', form.getRawValue())
      .subscribe((data: any) => { console.log(data);
        this.matsnackbar.open(data.data, "success", {
          duration: 3000,
        });
      },
        (error) => {
          this.matsnackbar.open(error.message, "error", {
            duration: 3000,
          });
          return Promise.reject('Location error');
        })

  }

  //Get current location and set it to the form lat & long fields
  public GetCurrentLocation():void{

    navigator.geolocation.getCurrentPosition((position)  => {
      
      this.CourseLocationForm.patchValue({'latitude':position.coords.latitude, 'longitude': position.coords.longitude});
  },
  (error)=>{
    this.matsnackbar.open(error.message, "error", {
      duration: 5000,
    });
    
  });

  }
  @ViewChild('timeModal') myModal;

  public openModal(id):void {
    this.myModal.nativeElement.className = 'modal fade show';
    var el = this.myModal.nativeElement;
    el.setAttribute('style', 'display: block;');

    this.BaseService.getAll('course/'+this.id+'/getTimeForCourse/'+id)
    .subscribe((data)=>{
      Object.assign(this.timeCourse, data);
      console.log(this.timeCourse);

      this.TimeCourseForm.patchValue({
        'start_time': this.timeCourse?.data?.start_time,
        'end_time': this.timeCourse?.data?.end_time,
       'day_period' : id,
      });
this.day_period = id;
      return this.timeCourse;
    },
    (error)=>{

      this.matsnackbar.open(error.message, "error", {
        duration: 5000,
      });
      
    })
  }

  public closeModal():void {
     this.myModal.nativeElement.className = 'modal hide';
     var el = this.myModal.nativeElement;
     el.setAttribute('style', 'display: none;');
  }

//API: Update the time of course
public updateCourseTime(form: FormGroup){
  this.TimeCourseForm.addControl('course_code', new FormControl(this.id));
    // this.TimeCourseForm.patchValue({'start_time':this.timeCourse?.data?.start_time, 'end_time': this.timeCourse?.data?.end_time})
    console.log(form.value);

    this.BaseService.addJson<any[]>('course/updateTime', form.getRawValue())
      .subscribe((data: any) => { console.log(data);
        this.matsnackbar.open(data.data, "success", {
          duration: 3000,
        });
      },
        (error) => {
          this.matsnackbar.open(error.message, "error", {
            duration: 3000,
          });
          return Promise.reject('Location error');
        })
}


}
