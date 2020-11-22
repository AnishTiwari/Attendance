from marshmallow import fields, Schema


from marshmallow import fields, Schema


# The Following Lines are generated by the gentity tool
# based on the input given in the entitytypes.xml file


class FeedbackSchema(Schema):
    id = fields.Int(dump_only=True)
    rating = fields.Integer()
    comment = fields.Str()
    course_code = fields.Str()


class ScheduleSchema(Schema):
    id = fields.Int(dump_only=True)
    day = fields.Integer()
    period = fields.Integer()
    start_time = fields.Time()
    end_time = fields.Time()
    courses = fields.Nested('CourseSchema', many=True, exclude=('schedules',))


class AttendanceSchema(Schema):
    id = fields.Int(dump_only=True)
    staff_id = fields.Integer()
    roll_no = fields.Integer()
    period = fields.Integer()
    is_present = fields.Bool()
    is_fingerprint = fields.Bool()
    logged_time = fields.DateTime()
    course_code = fields.Str()
    location = fields.Nested('LocationSchema', exclude=('attendance',))


class LocationSchema(Schema):
    id = fields.Int(dump_only=True)
    latitude = fields.Integer()
    longitude = fields.Integer()
    attendance = fields.Nested('AttendanceSchema', exclude=('location',))


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    ukey = fields.Str()
    display_name = fields.Str()
    pub_key = fields.Str()
    sign_count = fields.Integer()
    username = fields.Str()
    emailid = fields.Str()
    rollno = fields.Integer()
    rp_id = fields.Str()
    icon_url = fields.Str()
    credential_id = fields.Str()
    courses = fields.Nested('CourseSchema', many=True, exclude=('users',))


class CourseSchema(Schema):
    id = fields.Int(dump_only=True)
    course_name = fields.Str()
    course_code = fields.Str()
    latitude = fields.Integer()
    longitude = fields.Integer()
    users = fields.Nested('UserSchema', many=True, exclude=('courses',))
    schedules = fields.Nested('ScheduleSchema', many=True, exclude=('courses',))
    staff = fields.Nested('StaffSchema', exclude=('courses',))


class StaffSchema(Schema):
    id = fields.Int(dump_only=True)
    staff_name = fields.Str()
    staff_id_no = fields.Integer()
    courses = fields.Nested('CourseSchema', many=True, exclude=('staff',))


class DashboardSchema(Schema):
    username = fields.Str()
    rollno = fields.Integer()
    courses = fields.Nested('CourseSchema', many=True, exclude=('users',))


class AttendanceHistorySchema(Schema):
    period = fields.Integer()
    is_present = fields.Bool()
    logged_time = fields.DateTime()
    location = fields.Nested('LocationSchema', exclude=('attendance',))


class CourseProfileSchema(Schema):
    course_name = fields.Str()
    course_code = fields.Str()
    latitude = fields.Integer()
    longitude = fields.Integer()
    staff = fields.Nested('StaffSchema', exclude=('courses',))


class StaffDashboardProfileSchema(Schema):
    staff_name = fields.Str()
    staff_id_no = fields.Integer()
    courses = fields.Nested('CourseProfileSchema', many=True, exclude=('staff',))


class CourseScheduleSchema(Schema):
    day = fields.Integer()
    period = fields.Integer()
    latitude = fields.Integer()
    longitude = fields.Integer()


class StudentsSchema(Schema):
    username = fields.Str()
    rollno = fields.Integer()
    emailid = fields.Str()


class CourseFeedbackSchema(Schema):
    rating = fields.Integer()
    comment = fields.Str()

