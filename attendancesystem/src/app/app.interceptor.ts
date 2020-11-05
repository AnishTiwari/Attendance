import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable,EMPTY, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';


import {LoaderService} from './loader/loader.service';

@Injectable({
    providedIn: 'root'
})
export class CustomInterceptor implements HttpInterceptor {

    constructor(private loaderservice: LoaderService){};

    private ShowLoader() {
        this.loaderservice.show();
    }
    private HideLoader() {
        this.loaderservice.hide();
    }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       this.ShowLoader();
        //req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });

        //req = req.clone({ headers: req.headers.set('Access-Control-Allow-Origin', '*') });
        request = request.clone({
            withCredentials: true
        });
        // req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
       

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.error instanceof Error) {
                // A client-side or network error occurred. 
                console.error('An error occurred:', error.error.message);
              }
               else {
                // The backend returned an unsuccessful response code.
                // The response body may contain clues as to what went wrong,
                console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
              }
      
             
      
              // If you want to return the error on the upper level:
             // return throwError(error);
      
              // or just return nothing:
              return EMPTY;
            }),
            finalize(()=>{this.HideLoader()})
            );


    }
}
