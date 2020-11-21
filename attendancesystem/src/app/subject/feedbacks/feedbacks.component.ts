import { Component, OnInit } from '@angular/core';

import { BaseService } from '../../app.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Feedbacks } from './models/feedback';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feedbacks',
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent implements OnInit {

  constructor(private BaseService: BaseService, private matsnackbar: MatSnackBar, private activatedRoute:ActivatedRoute ) { }
public Feedbacks:Feedbacks = new Feedbacks();
public id;
  ngOnInit(): void {

    this.id = this.activatedRoute.parent.snapshot.paramMap.get('id');
    console.log(this.id);

    this.BaseService.getAll("course/getCourseFeedbacks/" + this.id)
    .subscribe((data) => {
      console.log(data)
      Object.assign(this.Feedbacks, data);

      console.log(this.Feedbacks.data.length);
      return this.Feedbacks;
    });

  }

}
