export class Schedule{
    day:number;
    period:number;
   
}

export class CourseSchedule{
    data: Schedule[];
    latitude:number;
    longitude:number;
  certificate : string;
}


export class time {
    start_time=null;
    end_time=null;
}

export class timeCourse{
data:time=null;
}
