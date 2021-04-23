from flask import Blueprint, request, jsonify, make_response
from sqlalchemy.orm import load_only

import os

from .. import app

from ..config import Config
from ..student.models import *
from ..student.types import *
from ..student import util

course = Blueprint("course", __name__)


# API: course-profile dashboard page
@course.route("getCourseSchedule/<variable>", methods=["GET"])
@util.login_required
def get_course_schedule(variable):
    fields = ["latitude", "longitude"]
    loc = (
        db.session.query(Course)
            .filter(Course.course_code == variable)
            .options(load_only(*fields))
            .all()
    )

    db_val = (
        db.session.query(Schedule)
            .join(Course, Schedule.courses)
            .filter(Course.course_code == variable)
            .all()
    )
    
    schd_schema = CourseScheduleSchema(many=True)
    post_json = schd_schema.dump(db_val)
    print(post_json)
    print(loc[0].latitude)

    root_path = os.path.dirname(app.instance_path)
    media_path = root_path + '/media/' + Config.COURSE_CERTIFICATE_FOLDER+ '/' + variable+'/'

    import base64

    with open(media_path + variable + ".pdf", "rb") as pdf_file:
        encoded_string = base64.b64encode(pdf_file.read())
    
    return jsonify(
        {"data": post_json, "latitude": loc[0].latitude, "longitude": loc[0].longitude, "certificate": encoded_string.decode("utf-8")}
    )


@course.route("updateLocation", methods=["POST"])
@util.login_required
def update_course_location():
    data = request.json
    print(data)
    res = (
        db.session.query(Course)
            .filter(Course.course_code == data["course_code"])
            .update({"latitude": data["latitude"], "longitude": data["longitude"]})
    )

    if not res:
        return make_response(db.error, 410)
    else:
        db.session.commit()
        return jsonify({"data": "Updated location"})


@course.route("getstudents/<course_code>", methods=["GET"])
@util.login_required
def get_course_students(course_code):
    fields = ["username", "rollno"]
    data = (
        User.query.join(User.courses)
            .filter(Course.course_code == course_code)
            .options(load_only(*fields))
            .all()
    )
    print(data)
    json = StudentsSchema(many=True)
    val = json.dump(data)
    return jsonify({"data": val})


@course.route("getCourseFeedbacks/<course_code>", methods=["GET"])
@util.login_required
def get_course_feedbacks(course_code):
    fields = ["rating", "comment"]
    data = (
        db.session.query(Feedback)
            .filter(Feedback.course_code == course_code)
            .options(load_only(*fields))
            .all()
    )
    json = CourseFeedbackSchema(many=True)
    val = json.dump(data)
    return jsonify({"data": val})


@course.route("<course_code>/getTimeForCourse/<day_period>", methods=["GET"])
@util.login_required
def get_time_for_course(course_code, day_period):
    try:
        day, period = list(day_period)
    except:
        day, period = 0, day_period
    loc = (
        db.session.query(Schedule)
            .join(Course, Schedule.courses)
            .filter(Course.course_code == course_code)
            .filter(Schedule.day == day, Schedule.period == period)
            .first()
    )
    json = TimeCourseSchema()
    val = json.dump(loc)

    return jsonify({"data": val})


@course.route("updateTime", methods=["POST"])
@util.login_required
def update_course_time():
    print(request.json)
    data = request.json
    day, period = list(str(data["day_period"]))
    res = (
        db.session.query(Schedule)
            .join(Course, Schedule.courses)
            .filter(Course.course_code == data["course_code"])
            .filter(Schedule.day == day, Schedule.period == period)
            .first()
    )

    if not res:
        return make_response(db.error, 410)
    else:
        res.start_time = data["start_time"]
        res.end_time = data["end_time"]
        db.session.commit()
        return jsonify({"data": "Updated Timings!!!"})


@course.route("getStudentAttendance/<course_code>/<roll_no>", methods=["GET"])
@util.login_required
def get_student_attendance(course_code, roll_no):
    attendance = (db.session.query(Attendance)
                  .filter(Attendance.course_code == course_code)
                  .filter(Attendance.roll_no == roll_no)
                  .all())
    json = AttendanceSchema(many=True)
    val = json.dump(attendance)

    return jsonify({"data": val})
