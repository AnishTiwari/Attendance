import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";

import * as base64js from 'base64-js';
import { BaseService } from '../app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private BaseService: BaseService) { }

  loginform: FormGroup;
  ngOnInit(): void {
    this.loginform = new FormGroup({
      inputrollno: new FormControl('')

    })
  }

  submitform(form: FormGroup) {
    this.Login(form);
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
    console.log(lat, long)
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


    var formdata = {
      "rollno": submitdata.value.inputrollno
    }
    this.BaseService
      .add<any[]>('login', formdata)
      .subscribe((data: any) => {

        navigator.credentials.get({
          publicKey: transformCredentialRequestOptions(data)

        })

          .then(
            (result) => {
              var data = transformAssertionForServer(result);

              navigator.geolocation.getCurrentPosition((position) => {
                this.Setlocation(position.coords.latitude, position.coords.longitude), { timeout: 10000 };


                console.log("_____________" + this.latitude);
                data["latitude"] =
                  this.latitude;
                data["longitude"] =
                  this.longitude;

                console.log(data);

                this.BaseService
                  .add<any[]>('verify_assertion_for_login', data)
                  .subscribe((data: any) => {
                    console.log(data);
                    console.log("USER LOGGED IN");
                    () => { this.BaseService.setUsername(data.login_rollno); }

                  })
              })
            },


          )
      },

        error => () => {
          "error"
        },
        () => {
          "completed"
        });

  }
}
