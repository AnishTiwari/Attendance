import { Component, OnInit } from '@angular/core';

import { BaseService } from '../../app.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import {HomeLeave} from "./models/manageleave.models";

@Component({
  selector: 'app-manageleave',
  templateUrl: './manageleave.component.html',
  styleUrls: ['./manageleave.component.css']
})
export class ManageleaveComponent implements OnInit {

  public homeLeave: HomeLeave;
  constructor(private BaseService:BaseService, private matsnackbar: MatSnackBar) {
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
	
      }, 
	(error:any) => {
            this.matsnackbar.open(error.message, "error", {
		duration: 3000,
            });
	});
  }
  
}
