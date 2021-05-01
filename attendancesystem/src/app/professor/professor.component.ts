import { Component, OnInit } from '@angular/core';

import { BaseService } from '../app.service';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import {TimetableComponent} from './timetable/timetable.component';
import { StaffDashboard, CourseSchedule } from './models/dashboard';

@Component({
    selector: 'app-professor',
    templateUrl: './professor.component.html',
    styleUrls: ['./professor.component.css']
})
export class ProfessorComponent implements OnInit {


    constructor(private BaseService: BaseService, private matsnackbar: MatSnackBar, private activatedRoute: ActivatedRoute, private _router:Router, private matdialog:MatDialog) { }
    public id:string;
    public CourseSchedule:CourseSchedule = new CourseSchedule();
    public staffdashboard: StaffDashboard = new StaffDashboard();  
    ngOnInit(): void {

	this.id = this.activatedRoute.snapshot.paramMap.get('id');
	console.log(this.id);

	
	this.BaseService.getAll("staff/"+this.id)
	    .subscribe( (data) =>{
		console.log(data);
		Object.assign(this.staffdashboard, data);
		return this.staffdashboard;
	    }


		      ) , 
	(error:any) => {
            this.matsnackbar.open(error.message, "error", {
		duration: 3000,
            });
            this._router.navigateByUrl('login');

        };

    }

    private background_color_list: string[] = ["linear-gradient(118deg, #911289, #25b9a4)",
					       "linear-gradient(258deg, #5c554d, #8db871)",
					       "linear-gradient(115deg, #c070bd, #825b22)",
					       "linear-gradient(60deg, #a6541d, #8bb6e4)",
					       "linear-gradient(to right, #4e4376, #2b5876)",
					       "linear-gradient(286deg, #33c2cc, #3318a3)",
					       "linear-gradient(181deg, #168256, #c8d3ca)",
					       "linear-gradient(147deg, #b777d6, #b8bd35)",
					       "linear-gradient(278deg, #ab26d7, #d0449d)",
					       "linear-gradient(318deg, #c152d0, #41c356)",
					       "linear-gradient(181deg, #4a7694, #9b94bd)"];
    public card_background_color: string;

    public getRandomColor() {
	let random_no = Math.floor((Math.random() * 9) + 1);
	this.card_background_color = this.background_color_list[random_no];

	let styles: string = this.card_background_color;

	return styles;
    }


    public navigateToCourse(course_id:string){
	let course_name = this.staffdashboard.data[0].courses[course_id].course_code;

	this._router.navigateByUrl('course/'+course_name);
    }


    public navigateToLeave(){
	this._router.navigateByUrl('manageleave');
    }

  
    public viewProfTimeTable(){
	this.BaseService.getAll("staff/getTimeTable/"+this.id)
	    .subscribe( (data) =>{
		console.log(data);
		Object.assign(this.CourseSchedule, data);
		this.matdialog.open(TimetableComponent, {data:this.CourseSchedule});
		return this.staffdashboard;

	    }


		      ) , 
	(error) => {
	    this.matsnackbar.open(error.message, "error", {
		duration: 3000,
	    });
	    this._router.navigateByUrl('login');

	};
    }
  
	public logout(): void {
		this.BaseService
			.add<any[]>('logout', {}).subscribe((data: any) => {
				this._router.navigateByUrl('login');
			},
				(error) => {
					this.matsnackbar.open("Error", "error", {
						duration: 3000,
					});

				});
		this._router.navigateByUrl('login');

	}

}
