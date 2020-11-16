export class course{
    course_code: string;
                    course_name: string;
                    latitude: number;
                    longitude: number;
}


export class staffs{
    staff_id_no:string;
    staff_name:string;
    courses : course[];
}

export class StaffDashboard{

    data:staffs[];

}