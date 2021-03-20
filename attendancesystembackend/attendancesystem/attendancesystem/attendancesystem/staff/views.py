from flask import Blueprint, request, jsonify, make_response, session
from sqlalchemy.orm import load_only

from ..student.models import *
from ..student.types import *
from ..student import util
staff = Blueprint("staff", __name__)


# API: staff-profile dashboard page
@staff.route("<variable>", methods=["GET"])
@util.staff_login_required
def staff_profile(variable):
    session['staff_id'] = variable
    db_val = db.session.query(Staff).filter(Staff.staff_id_no == variable).all()
    staff_schema = StaffDashboardProfileSchema(many=True)
    post_json = staff_schema.dump(db_val)
    return jsonify({"data": post_json})


@staff.route("getTimeTable/<staff_id>", methods=["GET"])
@util.staff_login_required
def get_staff_time_table(staff_id):
    # region professor timetable
    if 'staff_id' in session:
        print("SESSION EXISTS")
        print(session["staff_id"])
    staff = db.session.query(Staff).filter(Staff.staff_id_no == staff_id).options(load_only("id")).first()
    staff_courses = [r[0] for r in db.session.query(Course)
        .filter(Course.staff_id == staff.id).values("id")
                     ]
    staff_time_table = (db.session.query(Schedule,Course)
                        .join(Course, Schedule.courses)
                        .filter(Course.id.in_(staff_courses)).values("period","day","start_time","end_time","course_code"))
    schd_schema = StaffScheduleSchema(many=True)
    post_json = schd_schema.dump(staff_time_table)
    print(post_json)
    session.pop('staff_id', None)

    return jsonify({"data": post_json})

    # endregion


@staff.route("check_students", methods=["GET"])
@util.staff_login_required
def check_student_status():
    # security framework will first check
    # if the user is Staff or not
    return make_response("jsonify()", 200)
