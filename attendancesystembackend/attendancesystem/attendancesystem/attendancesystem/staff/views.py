from flask import Blueprint, request, jsonify, make_response
from ..student.models import *
from ..student.types import *

staff = Blueprint("staff", __name__)

# API: staff-profile dashboard page
@staff.route("<variable>", methods=["GET"])
def staff_profile(variable):
    db_val = db.session.query(Staff).filter(Staff.staff_id_no == variable).all()
    staff_schema = StaffDashboardProfileSchema(many=True)
    post_json = staff_schema.dump(db_val)
    return jsonify({"data": post_json})


@staff.route("check_students", methods=["GET"])
def check_student_status():
    # security framework will first check
    # if the user is Staff or not
    return make_response("jsonify()", 200)
