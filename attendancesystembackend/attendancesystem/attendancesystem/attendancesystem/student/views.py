import datetime
import os
from sqlalchemy import and_

from flask import Blueprint
from flask import request, make_response, jsonify, session
from webauthn import webauthn

from . import util
from .models import User, db, Location, Attendance, Feedback, Course
from .types import *

ADDR: str = "1fb5f6d57979.ngrok.io"

student = Blueprint("student", __name__)

RP_ID = ADDR
RP_NAME = "webauthn demo localhost"
ORIGIN = "https://" + ADDR
TRUST_ANCHOR_DIR = "trusted_attestation_roots"


@student.route("/register_student", methods=["POST"])
def register_student():
    username = request.form.get("register_username")
    emailid = request.form.get("register_emailid")
    rollno = request.form.get("register_rollno")
    display_name = username
    if not util.validate_username(username):
        return make_response(jsonify({"fail": "Invalid username."}), 401)

    if User.query.filter_by(username=username).first():
        return make_response(jsonify({"fail": "User already exists."}), 401)

    challenge = util.generate_challenge(32)
    ukey = util.generate_ukey()

    make_credential_options = webauthn.WebAuthnMakeCredentialOptions(
        challenge, RP_NAME, RP_ID, ukey, username, display_name, ORIGIN
    )
    print(make_credential_options)
    session["challenge"] = challenge.rstrip("=")
    session["register_ukey"] = ukey
    session["register_username"] = username
    session["register_rollno"] = rollno
    session["register_display_name"] = display_name
    session["register_emailid"] = emailid
    response = make_response(jsonify(make_credential_options.registration_dict), 200)

    return response


@student.route("/loginpassword", methods=["POST"])
def login_password():
    rollno = request.form.get("rollno")
    password = request.form.get("password")

    user = User.query.filter(and_(User.rollno == rollno, User.password == password)).first()
    print(user)
    if not user:
        return make_response(jsonify({"fail": "User does not exist."}), 401)
    else:
        # Add to session
        session['user_is_authenticated'] = True
        session['user_rollno'] = rollno

        if user.is_staff:
            session['is_staff'] = True
            return jsonify({"success": "Successfully logged in as {}".format(user.username), "staff": True,
                            "student_id": user.rollno})
        else:
            session['is_staff'] = False
            return jsonify({"success": "Successfully logged in as {}".format(user.username), "staff": False,
                            "staff_id": user.rollno})


@student.route("/login", methods=["POST"])
def webauthn_begin_assertion():
    rollno = request.form.get("rollno")
    user = User.query.filter_by(rollno=rollno).first()

    if not user:
        return make_response(jsonify({"fail": "User does not exist."}), 401)
    if not user.credential_id:
        return make_response(jsonify({"fail": "Unknown credential ID."}), 401)

    challenge = util.generate_challenge(32)

    webauthn_user = webauthn.WebAuthnUser(
        user.ukey,
        user.username,
        user.display_name,
        user.icon_url,
        user.credential_id,
        user.pub_key,
        user.sign_count,
        user.rp_id,
    )

    webauthn_assertion_options = webauthn.WebAuthnAssertionOptions(
        webauthn_user, challenge
    )
    session["challenge"] = challenge.rstrip("=")
    print(session.get('challenge'))
    print("hhhhhhhhhhhhhhhhhhhhhhhhh")
    response = make_response(jsonify(webauthn_assertion_options.assertion_dict), 200)
    return response


@student.route("/PostAssertionToServer", methods=["POST"])
def verify_credential_info():
    challenge = session.get("challenge")
    username = session.get("register_username")
    display_name = username
    ukey = session.get("register_ukey")
    emailid = session.get("register_emailid")
    rollno = session.get("register_rollno")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    password = request.form.get("password")
    registration_response = request.form
    trust_anchor_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), TRUST_ANCHOR_DIR
    )
    print(trust_anchor_dir)
    trusted_attestation_cert_required = True
    self_attestation_permitted = True
    none_attestation_permitted = True

    webauthn_registration_response = webauthn.WebAuthnRegistrationResponse(
        RP_ID,
        ORIGIN,
        registration_response,
        challenge,
        trust_anchor_dir,
        trusted_attestation_cert_required,
        self_attestation_permitted,
        none_attestation_permitted,
        uv_required=False,
    )  # User Verification

    try:
        webauthn_credential = webauthn_registration_response.verify()
    except Exception as e:
        return jsonify({"fail": "Registration failed. Error: {}".format(e)})

    credential_id_exists = User.query.filter_by(
        credential_id=webauthn_credential.credential_id
    ).first()
    if credential_id_exists:
        return make_response(jsonify({"fail": "Credential ID already exists."}), 401)

    existing_user = User.query.filter_by(
        username=username, rollno=rollno, emailid=emailid
    ).first()
    if not existing_user:
        if os.sys.version_info >= (3, 0):
            webauthn_credential.credential_id = str(
                webauthn_credential.credential_id, "utf-8"
            )
            webauthn_credential.public_key = str(
                webauthn_credential.public_key, "utf-8"
            )
        location = Location(latitude=latitude, longitude=longitude)

        user = User(
            ukey=ukey,
            username=username,
            display_name=display_name,
            pub_key=webauthn_credential.public_key,
            credential_id=webauthn_credential.credential_id,
            sign_count=webauthn_credential.sign_count,
            rp_id=RP_ID,
            emailid=emailid,
            rollno=rollno,
            icon_url="https://img.icons8.com/material-sharp/24/000000/cloud-network.png",
            password=password,
            is_staff=False
        )

        db.session.add(user)

        db.session.commit()
    else:
        return make_response(jsonify({"fail": "User already exists."}), 401)

    print("Successfully registered as {}.".format(username))

    return jsonify({"success": "User successfully registered.", "status": 200})


@student.route("/verify_assertion_for_login", methods=["POST"])
def verify_assertion():
    challenge = session.get("challenge")
    print(session)
    print("------------------------------------------")
    assertion_response = request.form
    credential_id = assertion_response.get("id")

    user = User.query.filter_by(credential_id=credential_id).first()
    if not user:
        return make_response(jsonify({"fail": "User does not exist."}), 401)

    webauthn_user = webauthn.WebAuthnUser(
        user.ukey,
        user.username,
        user.display_name,
        user.icon_url,
        user.credential_id,
        user.pub_key,
        user.sign_count,
        user.rp_id,
    )

    webauthn_assertion_response = webauthn.WebAuthnAssertionResponse(
        webauthn_user, assertion_response, challenge, ORIGIN, uv_required=False
    )  # User Verification

    sign_count = webauthn_assertion_response.verify()

    # Update counter.
    user.sign_count = sign_count
    db.session.add(user)
    db.session.commit()

    # Add to session
    session['user_is_authenticated'] = True
    session['user_rollno'] = user.rollno
    if user.is_staff:
        session['is_staff'] = True
        return jsonify(
            {"success": "Successfully logged in as {}".format(user.username), "staff": True, "student_id": user.rollno})
    else:
        session['is_staff'] = False
        return jsonify(
            {"success": "Successfully logged in as {}".format(user.username), "staff": False, "staff_id": user.rollno})


@student.route("/verify_assertion_for_attendance", methods=["POST"])
def verify_assertion_attendance():
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    rollno = request.form.get("rollno")
    staff_id = request.form.get("staff_code")
    course_code = request.form.get("course_code")
    period = request.form.get("period")

    challenge = session.get("challenge")

    assertion_response = request.form
    credential_id = assertion_response.get("id")

    user = User.query.filter_by(credential_id=credential_id).first()
    if not user:
        return make_response(jsonify({"fail": "User does not exist."}), 401)

    webauthn_user = webauthn.WebAuthnUser(
        user.ukey,
        user.username,
        user.display_name,
        user.icon_url,
        user.credential_id,
        user.pub_key,
        user.sign_count,
        user.rp_id,
    )

    webauthn_assertion_response = webauthn.WebAuthnAssertionResponse(
        webauthn_user, assertion_response, challenge, ORIGIN, uv_required=False
    )  # User Verification

    sign_count = webauthn_assertion_response.verify()

    # Update counter.
    user.sign_count = sign_count
    db.session.add(user)
    db.session.commit()
    attendance = Attendance.query.filter_by(roll_no=rollno, staff_id=staff_id).first()
    if attendance:
        return make_response(
            jsonify({"fail": "Attendance has already been registered"}), 401
        )

    # check if the attendance is given at the correct lat, long
    loc = Course.query.filter_by(latitude=latitude, longitude=longitude).first()
    if loc:
        return make_response(
            jsonify({"fail": "Location Incorrect, Please be at correct location"}), 401
        )

    location = Location(latitude=latitude, longitude=longitude)
    attendance = Attendance(
        roll_no=rollno,
        staff_id=staff_id,
        is_present=1,
        logged_time=datetime.datetime.now(),
        period=period,
        location=location,
        course_code=course_code,
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify(
        {"success": "Successfully authenticated as {}".format(user.username)}
    )


@student.route("getDashboardDetails", methods=["POST"])
def GetDashboardData():
    student_rollno = request.form.get('student_rollno')
    student_rollno='1601013'
    print(student_rollno)
    print("--------------------------------")

    # if student_rollno == "undefined":
    #     student_rollno = session['user_rollno']
    fetch_user = db.session.query(User).filter(User.rollno == student_rollno).first()
    user = DashboardSchema()
    user_json = user.dump(fetch_user)
    print(user_json)
    return jsonify(user_json)


# logout
@student.route("logout", methods=["POST"])
def logout():
    [session.pop(key, None) for key in list(session.keys())]
    if 'user_rollno' in session:
        print("0000000000000000000000000000000000000000000000000000000000")
    else:
        print(session)
        print("77777777777777777777777777777777777777777777777777777777777")
    session.clear()
    return make_response("logged out", 200)


# API : feedback POST
@student.route("postFeedback", methods=["POST"])
def get_feedback():
    data = request.json
    print(data)
    feedback_ = FeedbackSchema()
    feed = feedback_.load(data)
    f = Feedback(**feed)
    db.session.add(f)
    db.session.commit()

    return make_response("Your Feedback has been received anonymously", 200)


# API : GetAttendance history
@student.route("get_attendance_history", methods=["POST"])
def get_attendance_history():
    data = request.json
    attendance_history = (
        db.session.query(Attendance)
            .filter(Attendance.roll_no == data["rollno"])
            .filter(Attendance.staff_id == data["staff_code"])
            .filter(Attendance.course_code == data["course_code"])
            .all()
    )
    if not attendance_history:
        return jsonify({"fail": "Attendance history cannot be fetched"}, 401)
    attendance_history_ = AttendanceHistorySchema(many=True)
    post_json = attendance_history_.dump(attendance_history)
    print(post_json)
    return jsonify({"history": post_json})
