import { course_details } from './course_details';

export class StudentDashboard {
    rollno: string;
    username :string;
    public courses: course_details[];
    
}


export class Location{

    id:number;
    latitude:number;
    longitude:number;
}

export class AttendanceHistory{
    is_present: boolean;
        logged_time: any ;
        period: number;
        location:Location;
}

export class History{
    history : AttendanceHistory[];
}
