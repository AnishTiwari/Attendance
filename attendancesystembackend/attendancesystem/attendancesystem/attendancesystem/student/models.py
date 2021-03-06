from attendancesystem.attendancesystem import db
from sqlalchemy.dialects.mysql import TIME

# The Following Lines are generated by the gentity tool
# based on the input given in the entitytypes.xml file


class Staff(db.Model):
    __tablename__ = "staff"
    id = db.Column(db.Integer, primary_key=True)
    staff_name = db.Column(db.String(40))
    staff_id_no = db.Column(db.Integer)
    courses = db.relationship("Course", backref="staff")
    digitalsignatures = db.relationship("DigitalSignature", backref="staff")


class DigitalSignature(db.Model):
    __tablename__ = "digitalsignature"
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey("staff.id"))
    filename = db.Column(db.String(40))
    is_default = db.Column(db.Boolean)


user_course = db.Table(
    "user_course",
    db.Column("course_id", db.Integer, db.ForeignKey("course.id")),
    db.Column("user_id", db.Integer, db.ForeignKey("user.id")),
    db.Column("is_course_completed", db.Boolean, default=0)
)

schedule_course = db.Table(
    "schedule_course",
    db.Column("course_id", db.Integer, db.ForeignKey("course.id")),
    db.Column("schedule_id", db.Integer, db.ForeignKey("schedule.id")),
)


class Course(db.Model):
    __tablename__ = "course"
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(40))
    course_code = db.Column(db.String(40))
    latitude = db.Column(db.Integer)
    longitude = db.Column(db.Integer)
    staff_id = db.Column(db.Integer, db.ForeignKey("staff.id"))
    users = db.relationship(
        "User", secondary=user_course, backref=db.backref("courses")
    )
    schedules = db.relationship(
        "Schedule", secondary=schedule_course, backref=db.backref("courses")
    )


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    ukey = db.Column(db.String(240))
    display_name = db.Column(db.String(100))
    pub_key = db.Column(db.String(540))
    sign_count = db.Column(db.Integer)
    username = db.Column(db.String(50))
    emailid = db.Column(db.String(50))
    rollno = db.Column(db.Integer)
    rp_id = db.Column(db.String(540))
    icon_url = db.Column(db.String(540))
    credential_id = db.Column(db.String(540))
    is_staff = db.Column(db.Boolean)
    password = db.Column(db.String(50))


class Location(db.Model):
    __tablename__ = "location"
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Integer)
    longitude = db.Column(db.Integer)
    attendance = db.relationship("Attendance", backref="location", uselist=False)


class Attendance(db.Model):
    __tablename__ = "attendance"
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer)
    roll_no = db.Column(db.Integer)
    period = db.Column(db.Integer)
    is_present = db.Column(db.Boolean)
    is_fingerprint = db.Column(db.Boolean)
    logged_time = db.Column(db.DateTime)
    course_code = db.Column(db.String(40))
    location_id = db.Column(db.Integer, db.ForeignKey("location.id"), unique=True)


class Schedule(db.Model):
    __tablename__ = "schedule"
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Integer)
    period = db.Column(db.Integer)
    start_time = db.Column(TIME())
    end_time = db.Column(TIME())


class Feedback(db.Model):
    __tablename__ = "feedback"
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer)
    comment = db.Column(db.String(40))
    course_code = db.Column(db.String(40))
