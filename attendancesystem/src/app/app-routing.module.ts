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

const routes: Routes = [
{path:'', component:RegisterComponent},
{path :'login', component:LoginComponent},
{path :'student', component:StudentComponent},
{path :'staff/:id', component:ProfessorComponent},
{path :'course/:id', component:SubjectComponent,
  children:[
    {path: '', component:HomeComponent},
    {path: 'home', component:HomeComponent},
    {path: 'students', component:StudentsComponent},
    {path: 'feedbacks', component:FeedbacksComponent},
    {path: 'analytics', component:AnalyticsComponent},

  ]
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
