import { Time } from '@angular/common';

export interface StudentDashboardInterface {
    rollno: string;
     course_details:course_details[];

}
interface course_details{
    course_code:string;
    course_name:string;
    staff_name:string;
    days:days[];
}
interface periods{
    period_no :string;
    is_sensor: boolean;
    end_time:string;
    start_time:string;
}
interface days{
    day_no:string;
    periods : periods[];
}
