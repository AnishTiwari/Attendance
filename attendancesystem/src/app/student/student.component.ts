import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { BaseService } from '../app.service';
import { map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudentDashboard, History } from './models/studentdashboard';

import * as base64js from 'base64-js';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from '@angular/compiler/src/util';

@Component({
	selector: 'app-student',
	templateUrl: './student.component.html',
	styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
	feedbackform: FormGroup;
	private student_rollno: number;

	crctTime: boolean[] = [];
	constructor(private BaseService: BaseService, private matsnackbar: MatSnackBar, private _router: Router, private activatedRoute: ActivatedRoute) {
		this.student_rollno = this._router.getCurrentNavigation().extras.state?.user_id;

	}
	public history: History = new History();
	public studentdashboard: StudentDashboard = new StudentDashboard();
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
	private formdata;
	public getRandomColor() {
		let random_no = Math.floor((Math.random() * 9) + 1);
		this.card_background_color = this.background_color_list[random_no];

		let styles: string = this.card_background_color;

		return styles;
	}

	ngOnInit(): void {

		this.feedbackform = new FormGroup({

			onestar: new FormControl(''),
			twostar: new FormControl(''),
			threestar: new FormControl(''),
			fourstar: new FormControl(''),
			fivestar: new FormControl(''),
			comment: new FormControl(''),
			course_code: new FormControl(''),

		});


		this.formdata = {
			"student_rollno": this.student_rollno
		}

		this.BaseService
			.add<StudentDashboard>('getDashboardDetails', this.formdata)
			.subscribe((data: StudentDashboard) => {

				console.log(data);
				Object.assign(this.studentdashboard, data);

				this.studentdashboard.courses.forEach((course, inx) => { this.crctTime.push(true); });
				this.studentdashboard.courses.forEach((course, index) => {


					let exists = course.schedules.filter(x => x.day == new Date().getDay() && x.start_time.toString() <= new Date().toTimeString()
						&& x.end_time.toString() >= new Date().toTimeString());

					if (exists.length > 0) {

						this.crctTime[index] = false;

					}
				})

				console.log(this.studentdashboard);
				return this.studentdashboard;
			}
				, (error) => {
					this.matsnackbar.open(error.message, "error", {
						duration: 3000,
					});
					this._router.navigateByUrl('login');
				}
			);
	}

	public periodSub: string;
	public test(id: number) {
		console.log(id);
		console.log(this.studentdashboard.courses[id].course_code);
		this.periodSub = this.studentdashboard.courses[id].course_code;

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
	//API 
	public getAttendanceHistory(id: number) {

		this.BaseService
			.addJson<any[]>('get_attendance_history', {
				"course_code": this.studentdashboard.courses[id].course_code, "rollno": this.studentdashboard.rollno, "staff_code":
					this.studentdashboard.courses[id].staff.staff_id_no
			})
			.subscribe((data: any) => {
				console.log("GOT ATTENDANCE HISTORY"); console.log(data);
				Object.assign(this.history, data);
				console.log(this.history);
				return this.history;
			},
				(error) => {
					this.matsnackbar.open(error.message, "error", {
						duration: 3000,
					});
					this._router.navigateByUrl('login');

				}
			);
	}

	//API: send feedback
	public submitfeedbackform(form: FormGroup): void {
		console.log(this.periodSub);
		this.feedbackform.setControl('course_code', new FormControl(this.periodSub));
		//
		//TODO : Have a function to which does the below functionality & remove if - else chain
		//set the rating value here
		//
		if (form.value['onestar'] == '')
			this.feedbackform.removeControl('onestar');
		else {
			this.feedbackform.removeControl('onestar');
			this.feedbackform.addControl('rating', new FormControl('1'));

		}
		if (form.value['twostar'] == '')
			this.feedbackform.removeControl('twostar');
		else {
			this.feedbackform.removeControl('twostar');
			this.feedbackform.addControl('rating', new FormControl('2'));

		}
		if (form.value['threestar'] == '')
			this.feedbackform.removeControl('threestar');
		else {
			this.feedbackform.removeControl('threestar');
			this.feedbackform.addControl('rating', new FormControl('3'));

		}
		if (form.value['fourstar'] == '')
			this.feedbackform.removeControl('fourstar');
		else {
			this.feedbackform.removeControl('fourstar');
			this.feedbackform.addControl('rating', new FormControl('4'));

		}
		if (form.value['fivestar'] == '')
			this.feedbackform.removeControl('fivestar');
		else {

			this.feedbackform.removeControl('fivestar');
			this.feedbackform.addControl('rating', new FormControl('5'));

		}

		this.BaseService
			.addJson<any[]>('postFeedback', form.value)
			.subscribe((data: any) => { console.log(data); },
				(error) => {
					this.matsnackbar.open(error.message, "error", {
						duration: 3000,
					});
					return Promise.reject('Location error');
				},
				() => {
					this.matsnackbar.open("Feedback sent", "success", {
						duration: 3000,
					});
				}


			)
	}


	public submitform(): void {
		console.log(this.studentdashboard);
		// this.Login();
	}
	private b64enc(buf: any) {
		return base64js.fromByteArray(buf)
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
	}
	private b64RawEnc(buf: any) {
		return base64js.fromByteArray(buf)
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	}

	private hexEncode(buf) {
		return Array.from(buf)
			.map(function(x: any) {
				return ("0" + x.toString(16)).substr(-2);
			})
			.join("");
	}
	public latitude: any;

	public longitude: any;
	private Setlocation(lat: any, long: any) {
		console.log(lat, long)
		this.latitude = lat;
		this.longitude = long;
	}

	//API : postattendance
	public PostAttendance(id: number) {
		console.log(id);
		this.Login(id);
	}

	private Login(id: number): void {
		console.log(id);
		const transformCredentialRequestOptions = (credentialRequestOptionsFromServer) => {
			let { challenge, allowCredentials } = credentialRequestOptionsFromServer;

			challenge = Uint8Array.from(
				atob(challenge.replace(/\_/g, "/").replace(/\-/g, "+")), c => c.charCodeAt(0));

			allowCredentials = allowCredentials.map(credentialDescriptor => {
				let { id } = credentialDescriptor;
				id = id.replace(/\_/g, "/").replace(/\-/g, "+");
				id = Uint8Array.from(atob(id), c => c.charCodeAt(0));
				return Object.assign({}, credentialDescriptor, { id });
			});

			const transformedCredentialRequestOptions = Object.assign(
				{},
				credentialRequestOptionsFromServer,
				{ challenge, allowCredentials });

			return transformedCredentialRequestOptions;
		};

		const transformAssertionForServer = (newAssertion) => {
			const authData = new Uint8Array(newAssertion.response.authenticatorData);
			const clientDataJSON = new Uint8Array(newAssertion.response.clientDataJSON);
			const rawId = new Uint8Array(newAssertion.rawId);

			const sig = new Uint8Array(newAssertion.response.signature);

			const assertionClientExtensions = newAssertion.getClientExtensionResults();

			return {
				id: newAssertion.id,
				rawId: this.b64enc(rawId),
				type: newAssertion.type,
				authData: this.b64RawEnc(authData),
				clientData: this.b64RawEnc(clientDataJSON),
				signature: this.hexEncode(sig),
				assertionClientExtensions: JSON.stringify(assertionClientExtensions)
			};
		};


		let formdata = {
			"rollno": this.studentdashboard.rollno,
			"staff_code": this.studentdashboard.courses[id].staff.staff_id_no,
			"course_code": this.studentdashboard.courses[id].course_code,
			"period": this.studentdashboard.courses[id].schedules.filter(x => x.day == new Date().getDay() && x.start_time.toString() <= new Date().toTimeString() && x.end_time.toString() >= new Date().toTimeString())[0].id
		};

		this.BaseService
			.add<any[]>('login', formdata)
			.subscribe((data: any) => {

				navigator.credentials.get({
					publicKey: transformCredentialRequestOptions(data)

				})
					.then((result) => {

						let data = transformAssertionForServer(result);

						navigator.geolocation.getCurrentPosition((position) => {
							this.Setlocation(position.coords.latitude, position.coords.longitude), { timeout: 10000 };


							console.log("_____________" + this.latitude);
							data["latitude"] =
								this.latitude;
							data["longitude"] =
								this.longitude;

							data["rollno"] = formdata.rollno;
							data["staff_code"] = formdata.staff_code;
						    data["course_code"] = formdata.course_code;
						    data["period"] = formdata.period;
							this.BaseService
								.add<any[]>('verify_assertion_for_attendance', data)
								.subscribe((data: any) => {
									console.log(data);
								    if(data.success){
									this.crctTime[id] = true;
										this.matsnackbar.open("Your attendance has been registered", "success", {
						duration: 5000,
					});

								    }
								    else{

										this.matsnackbar.open("Sorry, your attendance could not be registered", "error", {
						duration: 5000,
					});

								    }
								    
								})
						}
							, (error) => {
								this.matsnackbar.open(error.message, "error", {
									duration: 3000,
								});

								return Promise.reject('Location error');

							}

						)
					},


					)
			},

				error => () => {
					"error";
				},
				() => {
					"completed";
				});

	}

  public showCompletionCertificate(course_code:string){
	  this.BaseService.addJson("showcompletioncertificate",{"course_code":course_code})
	    .subscribe((data:any)=>{
    const linkSource = "data:application/pdf;base64, "+ data.file;
    const downloadLink = document.createElement("a");
    const fileName = course_code+".pdf";

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
	    });
	}
}

