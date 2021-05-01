import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BaseService } from '../app.service';
import {HomeLeave} from "./models/leave.models";

@Component({
	selector: 'app-leave',
	templateUrl: './leave.component.html',
	styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
	public IsRequestForLeave: boolean = false;
  public IsLeaveHome: boolean = true;
  public leaveForm: FormGroup;
	public noOfDays: number;
  public homeLeave:HomeLeave;
  constructor(private BaseService: BaseService, private matsnackbar: MatSnackBar) {
    this.homeLeave =new HomeLeave();
  }

  ngOnInit(): void {
    this.getLeaveHome();
		this.leaveForm = new FormGroup({
			Start: new FormControl(),
			End: new FormControl(),
			Reason: new FormControl('', []),
			Additional_comments: new FormControl('', []),
			Attachments: new FormControl('', [Validators.required]),
			fileSource: new FormControl('', [Validators.required])
		});
	}
	public onFileChange(event) {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			this.leaveForm.patchValue({
				fileSource: file
			});

		}

	}

	submit() {

		this.BaseService.add("leave/requestforleave", this.leaveForm.value)
			.subscribe((data) => {
				console.log(data);
			}
			);

	}

  public getLeaveHome(){
	  this.IsLeaveHome=true;this.IsRequestForLeave=false

	  this.BaseService.getAll("leave/getallleaves")
	    .subscribe((data)=>{
	      console.log(data);
	      Object.assign(this.homeLeave, data);
	      console.log(this.homeLeave);
	    });
	  
	}
}
