from attendancesystem.attendancesystem import db

EnrolledCourse = db.Table('enrolled_courses',
                          db.Column('id',
                                    db.Integer,
                                    primary_key=True),

                          db.Column('user_id',
                                    db.Integer,
                                    db.ForeignKey('users.id', ondelete="cascade")),
                          db.Column('course_id',
                                    db.Integer,
                                    db.ForeignKey('courses.id', ondelete="cascade")))

StaffStudent = db.Table('staff_students',
                        db.Column('id', db.Integer, primary_key=True),
                        db.Column('staff_id', db.Integer, db.ForeignKey('staffs.id')),
                        db.Column('student_id', db.Integer, db.ForeignKey('users.id'))
                        )


StaffAssigned = db.Table('StaffAssigned',
        db.Column('id',db.Integer, primary_key=True),
    db.Column('staff_id', db.Integer, db.ForeignKey('staffs.id')),
    db.Column('course_id',db.Integer, db.ForeignKey('courses.id')))


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    ukey = db.Column(db.String(500), unique=True, nullable=False)
    credential_id = db.Column(db.String(250), unique=True, nullable=False)
    display_name = db.Column(db.String(160), unique=False, nullable=False)
    pub_key = db.Column(db.String(500), unique=True, nullable=True)
    sign_count = db.Column(db.Integer, default=0)
    username = db.Column(db.String(50), unique=True, nullable=False)
    emailid = db.Column(db.String(50), unique=True, nullable=False)
    rollno = db.Column(db.Integer, unique=True, nullable=False)
    rp_id = db.Column(db.String(253), nullable=False)
    icon_url = db.Column(db.String(2083), nullable=False)
    locations = db.relationship('Location',cascade="all,delete",uselist=False, backref="users")
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'))
    courses = db.relationship('Course', secondary=EnrolledCourse)
    staffs = db.relationship('Staff', cascade="all,delete", secondary=StaffStudent)
    # feedbacks = db.relationship('Feedback', cascade="all,delete")

    def __repr__(self):
        return '<User %r %r>' % (self.display_name, self.username)


class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.Text, nullable=False)
    course_code = db.Column(db.String(200), nullable=False)
    users = db.relationship('User', secondary=EnrolledCourse)
    staffs = db.relationship('Staff', cascade="all,delete", secondary=StaffAssigned)

    def __repr__(self):
        return '<%r - %r>' % (self.course_name, self.course_code)


#
class Staff(db.Model):
    __tablename__ = "staffs"
    id = db.Column(db.Integer, primary_key=True)
    staff_name = db.Column(db.String(200))
    staff_id_no = db.Column(db.Integer, nullable=False)
    courses = db.relationship('Course', cascade="all,delete", secondary=StaffAssigned)
    students = db.relationship('User', cascade="all,delete", secondary=StaffStudent)

    def __repr__(self):
        return '<%r -  %r>' % (self.staff_id, self.staff_name)


class Attendance(db.Model):
    __tablename__='attendances'
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, nullable=False)
    rollno = db.Column(db.Integer)
    is_present = db.Column(db.Boolean, nullable=False)
    logged_time = db.Column(db.DateTime, nullable=False)
    period = db.Column(db.Integer, nullable=False)
    IsFingerprint = db.Column(db.Boolean)
    logged_date = db.Column(db.Date, nullable=False)
    locations = db.relationship('Location',cascade="all,delete")
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'))

    def __repr__(self):
        return '< %r  was %r>' % (self.rollno, self.is_present)


class Period(db.Model):
    __tablename__='periods'
    id = db.Column(db.Integer, primary_key=True)
    courseschedule_id = db.Column(db.Integer, db.ForeignKey('courseschedules.id'))
    period_no = db.Column(db.Integer)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    IsFingerprint = db.Column(db.Boolean)
    # feedbacks = db.relationship('Feedback')

    def __repr__(self):
        return f'{self.courseschedule_id} is on following periods: {self.period_no}'


class CourseSchedule(db.Model):
    __tablename__='courseschedules'
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Integer, nullable=False)
    enrolled_course_id = db.Column(db.Integer, db.ForeignKey('enrolled_courses.id'))
    periods = db.relationship('Period')

    def __repr__(self):
        return f'{self.day}'


class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.String(25))
    longitude = db.Column(db.String(25))

    def __repr__(self):
        return '< %r  was %r>' % (self.latitude, self.longitude)


# class Feedback(db.Model):
#     __tablename__ = 'feedback'
#     id = db.Column(db.Integer, primary_key=True)
#     rating = db.Column(db.IntegeUserr)
#     comment = db.Column(db.String(50000))
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     period_id = db.Column(db.Integer, db.ForeignKey('period.id'))
#
#     def __repr__(self):
#         return '< %r  was %r>' % (self.rating, self.comment)
