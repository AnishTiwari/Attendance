export class Feedback{
	rating: Number;
	comment: String;
	course_code: String;
}

export class Attendance{
	staff_id: Number;
	roll_no: Number;
	period: Number;
	is_present: Boolean;
	is_fingerprint: Boolean;
	logged_time: Date;
	course_code: String;
	feedbacks: Feedback[];
}
export class data{
    data: Attendance[];
}
export class Attendances{

    attendance: data;
    }