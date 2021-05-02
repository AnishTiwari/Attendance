import { Component, OnInit } from '@angular/core';

import { BaseService } from '../../app.service';
import {Router} from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import {HomeLeave} from "./models/manageleave.models";

@Component({
  selector: 'app-manageleave',
  templateUrl: './manageleave.component.html',
  styleUrls: ['./manageleave.component.css']
})
export class ManageleaveComponent implements OnInit {

  public homeLeave: HomeLeave;
  constructor(private BaseService:BaseService, private matsnackbar: MatSnackBar, private _router:Router) {
    this.homeLeave = new HomeLeave();
  }

  ngOnInit(): void {
    	this.BaseService.getAll("leave/manageleaves")
      .subscribe( (data:HomeLeave) =>{
	Object.assign(this.homeLeave, data);
      });
  }

  public statusChangeLeave(id:number, rollno: number, logged_time:Date, status:string){
    this.BaseService.add("leave/statuschange",{id:id, rollno:rollno, logged_time:logged_time, status:status})
      .subscribe((data:any)=>{
	    this.matsnackbar.open(data.message, data.status, {
		duration: 5000,
            });
	this.ngOnInit();
      }, 
	(error:any) => {
            this.matsnackbar.open(error.message, "error", {
		duration: 3000,
            });
	});
  }

  
	public navigatelogout(): void {
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
