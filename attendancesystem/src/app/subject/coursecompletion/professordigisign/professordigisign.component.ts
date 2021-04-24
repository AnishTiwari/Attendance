import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

import { DigitalSignatures }  from './models/digitalsign.models';
@Component({
  selector: 'app-professordigisign',
  templateUrl: './professordigisign.component.html',
  styleUrls: ['./professordigisign.component.css']
})
export class ProfessordigisignComponent implements OnInit {
  public DigitalSignatures:DigitalSignatures = new DigitalSignatures();

  constructor(@Inject(MAT_DIALOG_DATA) digitalsignatureData) {
    Object.assign(this.DigitalSignatures , digitalsignatureData);
    console.log(this.DigitalSignatures);
    
  }


  ngOnInit(): void {
  }

}
