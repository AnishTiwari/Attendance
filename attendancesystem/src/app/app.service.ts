import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, empty } from 'rxjs';

import { environment } from './../environments/environment';
import { StudentDashboard } from './student/models/studentdashboard';
import { map, tap } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class BaseService {
    private formdata: any;
    private actionUrl: string;
    private username: number;

    public setUsername(rollno: number) {
        this.username = rollno;
    }

    public getUsername(): number {
        return this.username;
    }

    public setData(data: any) {
        this.formdata = new FormData();
        for (var attribute in data) {
            this.formdata.append(attribute, data[attribute])
        }
    }

    // sending json in body
   
    private options = {
        headers: new HttpHeaders().append('Content-Type', 'application/json')
       
      }
    private setBody(data:any){
        return JSON.stringify(data);
    } 

    constructor(private http: HttpClient) {
        this.actionUrl = `${environment.server}`;
    }

    getAll<T>(serviceName: string): Observable<T> {
        return this.http.get<T>(this.actionUrl + serviceName);
    }

    getSingle<T>(serviceName: string, id: number): Observable<T> {
        return this.http.get<T>(this.actionUrl + serviceName + id);
    }

    add<T>(serviceName: string, data: any): Observable<T> {

        this.setData(data);
        return this.http.post<T>(this.actionUrl + serviceName, this.formdata);
    }

    addJson<T>(serviceName: string, data: any): Observable<T> {
        return this.http.post<T>(this.actionUrl + serviceName, this.setBody(data), this.options);
    }

    update<T>(serviceName: string, id: number, itemToUpdate: any): Observable<T> {
        return this.http
            .put<T>(this.actionUrl + serviceName + id, itemToUpdate);
    }

    delete<T>(serviceName: string, id: number): Observable<T> {
        return this.http.delete<T>(this.actionUrl + serviceName + id);
    }
}   
