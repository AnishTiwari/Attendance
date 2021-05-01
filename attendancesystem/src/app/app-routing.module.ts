import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { StudentComponent } from './student/student.component';
import{ ProfessorComponent } from './professor/professor.component';
import{ SubjectComponent } from './subject/subject.component';
import{ HomeComponent } from './subject/home/home.component';
import{ StudentsComponent } from './subject/students/students.component';
import{ FeedbacksComponent } from './subject/feedbacks/feedbacks.component';
import{ AnalyticsComponent } from './subject/analytics/analytics.component';
import {LeaveComponent} from './leave/leave.component';
import {ManageleaveComponent} from './professor/manageleave/manageleave.component';

import { CoursecompletionComponent } from './subject/coursecompletion/coursecompletion.component';

const routes: Routes = [
{path:'', component:LoginComponent},
{path:'login', component:LoginComponent},
{path :'register', component:RegisterComponent},
{path :'student', component:StudentComponent},
  {path :'staff/:id', component:ProfessorComponent},
  {path :'manageleave', component:ManageleaveComponent},
{path :'course/:id', component:SubjectComponent,
  children:[
    {path: '', component:HomeComponent},
    {path: 'home', component:HomeComponent},
    {path: 'students', component:StudentsComponent},
    {path: 'feedbacks', component:FeedbacksComponent},
    {path: 'analytics', component:AnalyticsComponent},
    {path: 'coursecompletion', component: CoursecompletionComponent},
  ]
},
  {path:"leave", component:LeaveComponent},
{path:"**", redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
