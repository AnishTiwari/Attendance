import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { StudentComponent } from './student/student.component';
import{ ProfessorComponent } from './professor/professor.component';
import{ SubjectComponent } from './subject/subject.component';

const routes: Routes = [
{path:'', component:RegisterComponent},
{path :'login', component:LoginComponent},
{path :'student', component:StudentComponent},
{path :'staff/:id', component:ProfessorComponent},
{path :'course/:id', component:SubjectComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
