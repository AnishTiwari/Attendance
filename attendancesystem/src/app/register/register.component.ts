import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from "@angular/forms";
import * as base64js from 'base64-js';
import { BaseService } from '../app.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private lusername: string;
  private lemail: string;
  private lrollno: string;
  private lpassword: string = "Default";
  public ifFingerprintRequired: boolean = false;

  registerform: FormGroup;

  constructor(private BaseService: BaseService, private _router: Router, private matsnackbar: MatSnackBar) {
    this.lusername = this._router.getCurrentNavigation().extras.state?.username;
    this.lrollno = this._router.getCurrentNavigation().extras.state?.rollno;
    this.lemail = this._router.getCurrentNavigation().extras.state?.email;
  }

  ngOnInit() {
    console.log(this.lusername);
    if (this.lusername != undefined) {
      this.ifFingerprintRequired = true;

      this.registerform = new FormGroup({
        firstname: new FormControl(this.lusername, [Validators.required]),
        lastname: new FormControl(this.lusername, [Validators.required]),
        inputemail: new FormControl(this.lemail, [Validators.required]),
        inputrollno: new FormControl(this.lrollno, [Validators.required]),
        inputpassword: new FormControl(this.lpassword, [Validators.required])

      });
    }
    else {
      this.registerform = new FormGroup({

        firstname: new FormControl('', [Validators.required]),
        lastname: new FormControl('', [Validators.required]),
        inputemail: new FormControl('', [Validators.required]),
        inputrollno: new FormControl('', [Validators.required]),
        inputpassword: new FormControl('', [Validators.required])

      });
    }
  }

  submitform(form: FormGroup) {
    this.Register(form);
  }

  public reg_err_msg: string;
  private b64enc(buf: any) {
    return base64js.fromByteArray(buf)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  public latitude: any;

  public longitude: any;
  private Setlocation(lat: any, long: any) {
    this.latitude = lat;
    this.longitude = long;
  }

  async Register(submitdata: any): Promise<void> {
    if (this.registerform.invalid) {
      this.matsnackbar.open("Please check if you have given all the inputs correctly", "error", {
        duration: 5000,
      });

    }
    else {
      let formdata;
      if (this.lusername != undefined) {
        formdata =
        {
          "register_username": submitdata.value.firstname,
          "register_emailid": submitdata.value.inputemail,
          "register_rollno": submitdata.value.inputrollno,
          "register_password": submitdata.value.inputpassword,
          "login": true
        };
      }
      else {
        formdata =
        {
          "register_username": submitdata.value.firstname + submitdata.value.lastname,
          "register_emailid": submitdata.value.inputemail,
          "register_rollno": submitdata.value.inputrollno,
          "register_password": submitdata.value.inputpassword,
          "login": false
        };
      }

      const transformCredentialCreateOptions = (credentialCreateOptionsFromServer) => {
        let { challenge, user } = credentialCreateOptionsFromServer;
        user.id = Uint8Array.from(
          atob(credentialCreateOptionsFromServer.user.id
            .replace(/\_/g, "/")
            .replace(/\-/g, "+")
          ),
          c => c.charCodeAt(0));

        challenge = Uint8Array.from(
          atob(credentialCreateOptionsFromServer.challenge
            .replace(/\_/g, "/")
            .replace(/\-/g, "+")
          ),
          c => c.charCodeAt(0));

        const transformedCredentialCreateOptions = Object.assign(
          {}, credentialCreateOptionsFromServer,
          { challenge, user });

        return transformedCredentialCreateOptions;
      }

      const transformNewAssertionForServer = (newAssertion) => {
        const attObj = new Uint8Array(
          newAssertion.response.attestationObject);
        const clientDataJSON = new Uint8Array(
          newAssertion.response.clientDataJSON);
        const rawId = new Uint8Array(
          newAssertion.rawId);

        const registrationClientExtensions = newAssertion.getClientExtensionResults();

        return {
          id: newAssertion.id,
          rawId: this.b64enc(rawId),
          type: newAssertion.type,
          attObj: this.b64enc(attObj),
          clientData: this.b64enc(clientDataJSON),
          registrationClientExtensions: JSON.stringify(registrationClientExtensions)
        };
      }

      this.BaseService
        .add<any[]>('register_student', formdata)
        .subscribe(
          (data: any) => {
            navigator.credentials.create({
              publicKey: transformCredentialCreateOptions(data)
            })
              .then((credential) => {
                const newAssertionForServer = transformNewAssertionForServer(credential);

                navigator.geolocation.getCurrentPosition((position) => {
                  this.Setlocation(position.coords.latitude, position.coords.longitude), { timeout: 10000 };

                  newAssertionForServer["latitude"] =
                    this.latitude;
                  newAssertionForServer["longitude"] =
                    this.longitude;

                  newAssertionForServer["password"] = formdata.register_password;

                  this.BaseService
                    .add<any[]>('PostAssertionToServer', newAssertionForServer)
                    .subscribe((data: any) => {
                      console.log("User Registered Successfully!!!");

                      this._router.navigateByUrl('login');
                    },

                      (error) => () => {
                        this.matsnackbar.open(error.message, "error", {
                          duration: 3000,
                        });
                        return Promise.reject('Location error');
                      },
                      () => { }
                    );

                },
                  (error) => {

                    this.matsnackbar.open(error.message, "error", {
                      duration: 3000,
                    });

                    return Promise.reject('Location error');
                  });

              });
            //  .then(()=>{this._router.navigateByUrl('login');})

          },
          error => () => {
            this.matsnackbar.open(error.message, "error", {
              duration: 3000,
            });
            return Promise.reject('Location error');
          },
          () => {
            // this._router.navigateByUrl('login');
          })
        ;

    }
  }
}
