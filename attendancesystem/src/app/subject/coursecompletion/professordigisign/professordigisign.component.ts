import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer } from '@angular/platform-browser';
import { BaseService } from '../../../app.service';

import { DigitalSignatures } from './models/digitalsign.models';
@Component({
	selector: 'app-professordigisign',
	templateUrl: './professordigisign.component.html',
	styleUrls: ['./professordigisign.component.css']
})
export class ProfessordigisignComponent implements OnInit {
	public DigitalSignatures: DigitalSignatures = new DigitalSignatures();
	public DefaultFile: string;
	public Defaulted: boolean;
	constructor(@Inject(MAT_DIALOG_DATA) digitalsignatureData, private matsnackbar: MatSnackBar, private BaseService: BaseService, private sanitizer: DomSanitizer) {
		Object.assign(this.DigitalSignatures, digitalsignatureData);

		this.DigitalSignatures.digitalsignatures.data.map(x => x.file = this.sanitizer.bypassSecurityTrustResourceUrl
			("data:application/pdf;base64," + x.file));
	}


	ngOnInit(): void {
	}


	saveDigitalSigns() {

		console.log(this.DigitalSignatures);
		Array.from(this.DigitalSignatures.digitalsignatures.data).forEach(x => delete (x.file));
		this.BaseService.addJson('course/savedigitalsign', this.DigitalSignatures.digitalsignatures.data)
			.subscribe((data) => {

				this.matsnackbar.open("Saved", "success", {
					duration: 3000,
				});
			},
				error => {
					this.matsnackbar.open(error.message, "error", {
						duration: 3000,
					});
				}
			);

	}
}
