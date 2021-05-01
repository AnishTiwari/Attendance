import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar'
import { MatDatepickerModule } from '@angular/material/datepicker'  
import { MatNativeDateModule } from '@angular/material/core'  
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'; 


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { CustomInterceptor } from './app.interceptor';
import { LoaderComponent } from './loader/loader.component';
import { LoginComponent } from './login/login.component';
import { StudentComponent } from './student/student.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfessorComponent } from './professor/professor.component';
import { SubjectComponent } from './subject/subject.component';
import { HomeComponent } from './subject/home/home.component';
import { StudentsComponent } from './subject/students/students.component';
import { FeedbacksComponent } from './subject/feedbacks/feedbacks.component';
import { AnalyticsComponent } from './subject/analytics/analytics.component';
import { AttendanceComponent } from './subject/attendance/attendance.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TimetableComponent } from './professor/timetable/timetable.component';
import { CoursecompletionComponent } from './subject/coursecompletion/coursecompletion.component';
import { ProfessordigisignComponent } from './subject/coursecompletion/professordigisign/professordigisign.component';
import { LeaveComponent } from './leave/leave.component';
import { ManageleaveComponent } from './professor/manageleave/manageleave.component';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoaderComponent,
    LoginComponent,
    StudentComponent,
    ProfessorComponent,
    SubjectComponent,
    HomeComponent,
    StudentsComponent,
    FeedbacksComponent,
    AnalyticsComponent,
    AttendanceComponent,
    TimetableComponent,
    CoursecompletionComponent,
    ProfessordigisignComponent,
    LeaveComponent,
    ManageleaveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
	    MatDialogModule,
	    MatCardModule,	    
	    MatDatepickerModule,
	    MatFormFieldModule,
	    MatNativeDateModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
