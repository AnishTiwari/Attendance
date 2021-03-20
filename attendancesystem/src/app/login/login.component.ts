import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import * as base64js from 'base64-js';
import { error } from 'selenium-webdriver';
import { BaseService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private BaseService: BaseService, private matsnackbar: MatSnackBar, private _router: Router) { }

  loginform: FormGroup;
  loginformpassword: FormGroup;

  ngOnInit(): void {

    this.loginformpassword = new FormGroup({
      inputrollno: new FormControl(''),
      inputpassword: new FormControl('')

    });

    this.loginform = new FormGroup({
      inputrollno: new FormControl('')
    });
  }
  public IsFingerPrint:boolean = true;

  submitform(form: FormGroup) {
    this.Login(form);
  }

  submitformpassword(form: FormGroup){
    console.log(form);
    let formdata = {
      "rollno": form.value.inputrollno,
      "password": form.value.inputpassword,
    };

    this.BaseService
      .add<any[]>('loginpassword', formdata)
      .subscribe((data: any) => {
        if (data.is_staff)
        this._router.navigate(['staff/' + data.login_rollno], { state: { 'user_id': data.student_id } });
      else
        this._router.navigate(['student'], { state: { 'user_id': data.staff_id } });

      },
      error =>{
        console.log(error);
        this.matsnackbar.open("Login Error", "error", {
          duration: 3000,
        });

      });
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
      .map(function (x: any) {
        return ("0" + x.toString(16)).substr(-2);
      })
      .join("");
  }

  public latitude: any;

  public longitude: any;

  private Setlocation(lat: any, long: any) {
    this.latitude = lat;
    this.longitude = long;
  }

  Login(submitdata: any): void {

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
      "rollno": submitdata.value.inputrollno
    };

    this.BaseService
      .add<any[]>('login', formdata)
      .subscribe((data: any) => {

        console.log(data);
        navigator.credentials.get({
          publicKey: transformCredentialRequestOptions(data)

        })
          .catch((e) => {

            this.matsnackbar.open(e, "error", {
              duration: 3000,
            });

            return Promise.reject('Location error');
          })
          .then(
            (result) => {

              var data = transformAssertionForServer(result);

              navigator.geolocation.getCurrentPosition((position) => {
                this.Setlocation(position.coords.latitude, position.coords.longitude), { timeout: 10000 };

                // console.log("_____________" + this.latitude);
                // data["latitude"] =
                //   this.latitude;
                // data["longitude"] =
                //   this.longitude;

                this.BaseService
                  .add<any[]>('verify_assertion_for_login', data)
                  .subscribe((data: any) => {
                    console.log(data);
                    console.log("USER LOGGED IN");
                    if (data.is_staff)
                      this._router.navigate(['staff/' + data.login_rollno], { state: { 'user_id': data.student_id } });
                    else
                      this._router.navigate(['student'], { state: { 'user_id': data.staff_id } });

                    () => { this.BaseService.setUsername(data.student_id ?? data.staff_id); }

                  },
                    error => () => {
                      this.matsnackbar.open(error.message, "error", {
                        duration: 3000,
                      });
                    }
                   );
              })
            },

          )
      },
        error => {
          this.matsnackbar.open(error.message, "error", {
            duration: 3000,
          });
        }
       );

  }
}
