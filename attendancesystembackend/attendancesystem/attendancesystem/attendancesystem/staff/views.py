from flask import Blueprint,request,jsonify, make_response


staff = Blueprint('staff',__name__)

@staff.route('check_students',methods=["GET"])
def check_student_status():
    # security framework will first check
    # if the user is Staff or not
    return make_response("jsonify()",200)
