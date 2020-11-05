import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import * as base64js from 'base64-js';
import { BaseService } from '../app.service';

@Component({
  //encapsulation:ViewEncapsulation.None,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
 
  registerform:FormGroup;
  
  constructor(private BaseService: BaseService) {  }

  ngOnInit()
  {
      this.registerform= new FormGroup({
      
      firstname :new FormControl(''),
      lastname :new FormControl(''),
      inputemail :new FormControl(''),
      inputrollno :new FormControl('')

      })
} 

submitform(form:FormGroup){
  
  this.Register(form);
}


private b64enc(buf: any) {
  return base64js.fromByteArray(buf)
                 .replace(/\+/g, "-")
                 .replace(/\//g, "_")
                 .replace(/=/g, "");
}
private b64RawEnc(buf:any) {
  return base64js.fromByteArray(buf)
  .replace(/\+/g, "-")
  .replace(/\//g, "_");
}

private hexEncode(buf) {
  return Array.from(buf)
              .map(function(x:any) {
                  return ("0" + x.toString(16)).substr(-2);
      })
              .join("");
}
 public latitude:any;

 public longitude:any;
private Setlocation(lat:any, long:any){
  console.log(lat,long)
  this.latitude = lat;
  this.longitude = long;
}

  Register(submitdata:any): void {
       var formdata =
         {
            "register_username":submitdata.value.firstname + submitdata.value.lastname,
            "register_emailid":submitdata.value.inputemail,
            "register_rollno":submitdata.value.inputrollno
          }
          
          const transformCredentialCreateOptions = (credentialCreateOptionsFromServer) => {
            let {challenge, user} = credentialCreateOptionsFromServer;
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
                    {challenge, user});
        
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
        .add<any[]>('register_student',formdata)
        .subscribe((data: any) =>{ 
         
               navigator.credentials.create({
               publicKey: transformCredentialCreateOptions(data)
                 }).then(
            
                 
               (credential)=>{
                console.log("SSSSSSS");
                 const newAssertionForServer = transformNewAssertionForServer(credential);

                 console.log("thi is the thing"+newAssertionForServer);
                 navigator.geolocation.getCurrentPosition((position)  => {
              this.Setlocation(position.coords.latitude, position.coords.longitude),{timeout:10000};

              newAssertionForServer["latitude"]= 
              this.latitude;
              newAssertionForServer["longitude"]=
                   this.longitude;
             
                 this.BaseService
                 .add<any[]>('PostAssertionToServer',newAssertionForServer)
                 .subscribe((data: any)=> {console.log("User Registered Successfully!!!");},
                    
                 (error)=>()=>{console.log("Validation Error from the server");},
                     ()=>{}
                 );}

                 );
                     
               })
                 
         },
        error => () => {
            "error"
        },
        () => {
            "completed"
        });
  }
}
