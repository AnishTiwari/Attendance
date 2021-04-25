from flask import Blueprint, request, jsonify, make_response, session
from sqlalchemy.orm import load_only
import sys
import datetime
from cryptography.hazmat import backends
from cryptography.hazmat.primitives.serialization import pkcs12

from endesive.pdf import cms

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
    loc = (db.session.query(Course).filter(
        Course.course_code == variable).options(load_only(*fields)).all())

    db_val = (db.session.query(Schedule).join(
        Course, Schedule.courses).filter(Course.course_code == variable).all())

    schd_schema = CourseScheduleSchema(many=True)
    post_json = schd_schema.dump(db_val)
    print(post_json)
    print(loc[0].latitude)

    root_path = os.path.dirname(app.instance_path)
    media_path = root_path + '/media/' + Config.COURSE_CERTIFICATE_FOLDER + '/' + variable + '/'

    import base64

    with open(media_path + variable + ".pdf", "rb") as pdf_file:
        encoded_string = base64.b64encode(pdf_file.read())

    return jsonify({
        "data": post_json,
        "latitude": loc[0].latitude,
        "longitude": loc[0].longitude,
        "certificate": encoded_string.decode("utf-8")
    })


@course.route("updateLocation", methods=["POST"])
@util.login_required
def update_course_location():
    data = request.json
    print(data)
    res = (db.session.query(Course).filter(
        Course.course_code == data["course_code"]).update({
            "latitude":
            data["latitude"],
            "longitude":
            data["longitude"]
        }))

    if not res:
        return make_response(db.error, 410)
    else:
        db.session.commit()
        return jsonify({"data": "Updated location"})


@course.route("getstudents/<course_code>", methods=["GET"])
@util.login_required
def get_course_students(course_code):
    fields = ["username", "rollno"]
    data = (User.query.join(User.courses).filter(
        Course.course_code == course_code).options(load_only(*fields)).all())
    print(data)
    json = StudentsSchema(many=True)
    val = json.dump(data)
    return jsonify({"data": val})


@course.route("getCourseFeedbacks/<course_code>", methods=["GET"])
@util.login_required
def get_course_feedbacks(course_code):
    fields = ["rating", "comment"]
    data = (db.session.query(Feedback).filter(
        Feedback.course_code == course_code).options(load_only(*fields)).all())
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
    loc = (db.session.query(Schedule).join(
        Course,
        Schedule.courses).filter(Course.course_code == course_code).filter(
            Schedule.day == day, Schedule.period == period).first())
    json = TimeCourseSchema()
    val = json.dump(loc)

    return jsonify({"data": val})


@course.route("updateTime", methods=["POST"])
@util.login_required
def update_course_time():
    print(request.json)
    data = request.json
    day, period = list(str(data["day_period"]))
    res = (db.session.query(Schedule).join(Course, Schedule.courses).filter(
        Course.course_code == data["course_code"]).filter(
            Schedule.day == day, Schedule.period == period).first())

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
    attendance = (db.session.query(Attendance).filter(
        Attendance.course_code == course_code).filter(
            Attendance.roll_no == roll_no).all())
    json = AttendanceSchema(many=True)
    val = json.dump(attendance)

    return jsonify({"data": val})


# Course Completion home page
@course.route("coursecompletion/<course_code>", methods=["GET"])
@util.login_required
def get_course_completion(course_code):
    staff = (db.session.query(Staff).filter(
        Staff.staff_id_no == session.get('user_rollno')).first())
    course = (db.session.query(Course).filter(
        Course.course_code == course_code).filter(
            Course.staff_id == staff.id).first())
    student_data = (db.session.query(
        User.username, User.rollno,
        user_course).filter(user_course.c.course_id == course.id).filter(
            User.id == user_course.c.user_id).all())
    json = CourseCompletionSchema(many=True)
    val = json.dump(student_data)
    print(val)
    return jsonify({"data": val})


# Course Professor Available Digital Signature
@course.route("getprofessordigitalsignature/", methods=["GET"])
@util.login_required
def get_professor_digital_signature():
    staff_id = (db.session.query(Staff.id).filter(
        Staff.staff_id_no == session.get('user_rollno')).first())

    root_path = os.path.dirname(app.instance_path)
    media_path = root_path + '/media/' + Config.PROFESSOR_CERTIFICATE_FOLDER + '/' + session.get(
        'user_rollno') + '/'

    signs = (db.session.query(DigitalSignature.filename,
                              DigitalSignature.is_default).filter(
                                  DigitalSignature.staff_id == staff_id).all())
    import base64
    encoded_string = []
    for filename in os.listdir(media_path):
        if filename.endswith(".png"):
            with open(os.path.join(media_path, filename), "rb") as image_file:
                encoded_string.append({
                    "file":
                    base64.b64encode(image_file.read()).decode("utf-8"),
                    "name":
                    filename,
                    "is_default": [x[1] for x in signs if x[0] == filename][0]
                })

    print(encoded_string)
    return jsonify({"data": encoded_string})


@course.route("savedigitalsign", methods=["POST"])
@util.login_required
def save_digital_sign():

    staff_id = (db.session.query(Staff.id).filter(
        Staff.staff_id_no == session.get('user_rollno')).first())

    res = request.json
    for r in res:

        dig = (db.session.query(DigitalSignature).filter(
            DigitalSignature.filename == r['name']).filter(
                DigitalSignature.staff_id == staff_id).first())
        dig.is_default = r['is_default']

    db.session.commit()
    return jsonify({"data": "Success"})


@course.route("invokecertificate", methods=["POST"])
@util.login_required
def invoke_certificate():
    print(request.json)

    staff = (db.session.query(User).filter(
        Staff.staff_id_no == session.get('user_rollno')).first())

    staff_id = (db.session.query(Staff.id).filter(
        Staff.staff_id_no == session.get('user_rollno')).first())

    default_sign_filename = (db.session.query(
        DigitalSignature.filename).filter(
            DigitalSignature.staff_id == staff_id).filter(
                DigitalSignature.is_default == True).first())
    print(default_sign_filename[0])

    root_path = os.path.dirname(app.instance_path)
    professor_media_path = root_path + '/media/' + Config.PROFESSOR_CERTIFICATE_FOLDER + '/' + session.get(
        'user_rollno') + '/' + default_sign_filename[0]

    post_data = request.json

    student_id = (db.session.query(
        User.id).filter(User.rollno == post_data["rollno"]).first())
    course_id = (db.session.query(Course.id).filter(
        Course.course_code == post_data["course_code"]).first())

    course_media_path = root_path + '/media/' + Config.COURSE_CERTIFICATE_FOLDER + '/' + post_data[
        'course_code'] + '/' + post_data['course_code'] + ".pdf"

    keys_path = root_path + '/media/keys'

    date = datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    date = date.strftime("D:%Y%m%d%H%M%S+00'00'")
    dct = {
        "aligned": 0,
        "sigflags": 3,
        "sigflagsft": 132,
        "sigpage": 0,
        "sigbutton": True,
        "sigfield": "Signature1",
        "auto_sigfield": True,
        "sigandcertify": True,
        "signaturebox": (470, 840, 570, 640),
        # "signature": "Document SIgning",
        "signature_img": professor_media_path,
        "contact": staff.emailid,
        "location": "Coimbatore",
        "signingdate": date,
        "reason": "Course Completion",
        "password": "123456654321",
    }
    with open(keys_path + "/my_pkcs12.p12", "rb") as fp:
        p12 = pkcs12.load_key_and_certificates(fp.read(), b"123456654321",
                                               backends.default_backend())
    fname = course_media_path

    datau = open(fname, "rb").read()
    datas = cms.sign(datau, dct, p12[0], p12[1], p12[2], "sha256")

    student_media_path = root_path + '/media/' + Config.STUDENT_CERTIFICATE_FOLDER + '/' + post_data[
        "rollno"] + "/"

    signed_file_name = student_media_path + post_data["course_code"] + ".pdf"
    with open(signed_file_name, "wb") as fp:
        fp.write(datau)
        fp.write(datas)

    result = db.session.execute(
        'Update user_course set is_course_completed=True Where user_id = :student_id and course_id = :course_id',
        {
            'student_id': student_id,
            "course_id": course_id
        })
    db.session.commit()

    return jsonify({"data": "invoked"})


@course.route("revokecertificate", methods=["POST"])
@util.login_required
def revoke_certificate():
    post_data = request.json

    student_id = (db.session.query(
        User.id).filter(User.rollno == post_data["rollno"]).first())
    course_id = (db.session.query(Course.id).filter(
        Course.course_code == post_data["course_code"]).first())
    result = db.session.execute(
        'Update user_course set is_course_completed=False Where user_id = :student_id and course_id = :course_id',
        {
            'student_id': student_id,
            "course_id": course_id
        })
    db.session.commit()
    root_path = os.path.dirname(app.instance_path)

    student_media_path = root_path + '/media/' + Config.STUDENT_CERTIFICATE_FOLDER + '/' + post_data[
        "rollno"] + "/"

    certificate_path = student_media_path + post_data["course_code"] + ".pdf"
    os.remove(certificate_path)

    return jsonify({"data": "Revoked"})
