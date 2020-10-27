import os
import datetime
from flask import Blueprint
from flask import request, make_response, jsonify
from webauthn import webauthn
from collections import defaultdict
from . import util
from .models import User, db, Location, Attendance, Course, StaffStudent, EnrolledCourse, Staff, Period, CourseSchedule, \
    StaffAssigned

ADDR: str = '4d73d63a5e5f.ngrok.io'

student = Blueprint('student', __name__)

RP_ID = ADDR
RP_NAME = 'webauthn demo localhost'
ORIGIN = 'https://' + ADDR
TRUST_ANCHOR_DIR = 'trusted_attestation_roots'


@student.route('/register_student', methods=['POST'])
def register_student():
    username = request.form.get('register_username')
    emailid = request.form.get('register_emailid')
    rollno = request.form.get('register_rollno')
    display_name = username
    if not util.validate_username(username):
        return make_response(jsonify({'fail': 'Invalid username.'}), 401)

    if User.query.filter_by(username=username).first():
        return make_response(jsonify({'fail': 'User already exists.'}), 401)

    challenge = util.generate_challenge(32)
    ukey = util.generate_ukey()

    make_credential_options = webauthn.WebAuthnMakeCredentialOptions(
        challenge, RP_NAME, RP_ID, ukey, username, display_name,
        ORIGIN)
    print(make_credential_options)
    response = make_response(jsonify(make_credential_options.registration_dict), 200)
    response.set_cookie("challenge", challenge.rstrip('='), httponly=True, samesite='None', secure=True)
    response.set_cookie("register_ukey", ukey, httponly=True, samesite='None', secure=True)
    response.set_cookie("register_username", username, httponly=True, samesite='None', secure=True)
    response.set_cookie("register_rollno", rollno, httponly=True, samesite='None', secure=True)
    response.set_cookie("register_display_name", display_name, httponly=True, samesite='None', secure=True)
    response.set_cookie("register_emailid", emailid, httponly=True, samesite='None', secure=True)
    return response


@student.route('/login', methods=['POST'])
def webauthn_begin_assertion():
    rollno = request.form.get('login_rollno')

    user = User.query.filter_by(rollno=rollno).first()

    if not user:
        return make_response(jsonify({'fail': 'User does not exist.'}), 401)
    if not user.credential_id:
        return make_response(jsonify({'fail': 'Unknown credential ID.'}), 401)

    challenge = util.generate_challenge(32)

    webauthn_user = webauthn.WebAuthnUser(
        user.ukey, user.username, user.display_name, user.icon_url,
        user.credential_id, user.pub_key, user.sign_count, user.rp_id)

    webauthn_assertion_options = webauthn.WebAuthnAssertionOptions(
        webauthn_user, challenge)

    response = make_response(jsonify(webauthn_assertion_options.assertion_dict), 200)
    response.set_cookie("challenge", challenge.rstrip('='), httponly=True, samesite='None', secure=True)
    return response


@student.route('/PostAssertionToServer', methods=['POST'])
def verify_credential_info():
    challenge = request.cookies.get('challenge')
    username = request.cookies.get('register_username')
    display_name = username
    ukey = request.cookies.get('register_ukey')
    emailid = request.cookies.get('register_emailid')
    rollno = request.cookies.get('register_rollno')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    registration_response = request.form
    trust_anchor_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), TRUST_ANCHOR_DIR)
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
        uv_required=False)  # User Verification

    try:
        webauthn_credential = webauthn_registration_response.verify()
    except Exception as e:
        return jsonify({'fail': 'Registration failed. Error: {}'.format(e)})

    credential_id_exists = User.query.filter_by(
        credential_id=webauthn_credential.credential_id).first()
    if credential_id_exists:
        return make_response(
            jsonify({
                'fail': 'Credential ID already exists.'
            }), 401)

    existing_user = User.query.filter_by(username=username, rollno=rollno, emailid=emailid).first()
    if not existing_user:
        if os.sys.version_info >= (3, 0):
            webauthn_credential.credential_id = str(
                webauthn_credential.credential_id, "utf-8")
            webauthn_credential.public_key = str(
                webauthn_credential.public_key, "utf-8")
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
            icon_url='https://img.icons8.com/material-sharp/24/000000/cloud-network.png',
            locations=location,
        )

        db.session.add(user)
        db.session.commit()
    else:
        return make_response(jsonify({'fail': 'User already exists.'}), 401)

    print('Successfully registered as {}.'.format(username))

    return jsonify({'success': 'User successfully registered.'})


@student.route('/verify_assertion_for_login', methods=['POST'])
def verify_assertion():
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")
    rollno = request.form.get("rollno")
    staff_id = request.form.get("staff_id")
    period = request.form.get("period")

    challenge = request.cookies.get('challenge')

    assertion_response = request.form
    credential_id = assertion_response.get('id')

    user = User.query.filter_by(credential_id=credential_id).first()
    if not user:
        return make_response(jsonify({'fail': 'User does not exist.'}), 401)

    webauthn_user = webauthn.WebAuthnUser(
        user.ukey, user.username, user.display_name, user.icon_url,
        user.credential_id, user.pub_key, user.sign_count, user.rp_id)

    webauthn_assertion_response = webauthn.WebAuthnAssertionResponse(
        webauthn_user,
        assertion_response,
        challenge,
        ORIGIN,
        uv_required=False)  # User Verification

    sign_count = webauthn_assertion_response.verify()

    # Update counter.
    user.sign_count = sign_count
    db.session.add(user)
    db.session.commit()
    attendance = Attendance.query.filter_by(rollno=rollno, staff_id=staff_id, period=period).first()
    if attendance:
        return make_response(jsonify({'fail': 'Attendance has already been registered'}), 401)
    location = Location(latitude=latitude, longitude=longitude)
    attendance = Attendance(
        rollno=rollno,
        staff_id=staff_id,
        is_present=True,
        logged_time=datetime.datetime.now(),
        period=period,
        locations=location
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({
        'success':
            'Successfully authenticated as {}'.format(user.username)
    })


def serialize_message_dashboard(data):
    # dict = {}
    # for i in range(0, len(data)):
    #     print(i)
    #     values = data[i]
    #     if values[0] not in dict:
    #         dict["course_name"] = values[0]
    #
    # print(dict)

    dict = {
        "rollno": "1601016",
        "course_details": [{
            "course_name": "Test_Course",
            "course_code": "16CS251",
            "staff_name": "Test Staff1",
            "days": [
                {
                    "day_no": '1',

                    'periods': [
                        {"period_no": "1",
                         "start_time": "10:10:10",
                         "end_time": "12:12:12",
                         "is_sensor": "1"
                         },
                        {
                            "period_no": "7",
                            "start_time": "16:10:10",
                            "end_time": "17:00:00",
                            "is_sensor": "0"
                        }
                    ]
                }
                ,
                {
                    "day_no": '3',
                    "periods": [
                        {"period_no": "3",
                         "start_time": "10:10:10",
                         "end_time": "12:12:12",
                         "is_sensor": "1"

                         }]

                },
                {
                    'day_no': '4',
                    "periods":
                        [
                            {
                                "period_no": '3',
                                "start_time": "10:10:10",
                                "end_time": "12:12:12",
                                "is_sensor": "1"

                            }
                        ]
                }

            ]}

            ,
            {
                "course_name": "Text_Course",
                "course_code": "16CS252",
                "staff_name": "Test Staff2",
                "days": [{
                    'day_no': '1',
                    'periods': [

                        {
                            "period_no": "5",
                            "start_time": "10:10:10",
                            "end_time": "12:12:12",
                            "is_sensor": "1"

                        }]
                }]
            }, {
                "course_name": "Text_Course",
                "course_code": "16CS252",
                "staff_name": "Test Staff2",
                "days": [{
                    'day_no': '1',
                    'periods': [

                        {
                            "period_no": "5",
                            "start_time": "10:10:10",
                            "end_time": "12:12:12",
                            "is_sensor": "1"

                        }]
                }]
            }

        ]
    }

    return dict


@student.route('getDashboardDetails', methods=["POST"])
def GetDashboardData():
    student_rollno = 4  # request.form.get('student_rollno')
    print(student_rollno)
    course_details_list = db.session.query(Course.course_name, Staff.staff_name, Course.course_code, CourseSchedule.day,
                                           Period.period_no, Period.IsFingerprint, Period.start_time, Period.end_time) \
        .select_from(Course).join(EnrolledCourse).join(StaffAssigned).join(Staff).join(StaffStudent).join(
        CourseSchedule).join(Period).filter(
        User.rollno == student_rollno).all()
    print(course_details_list)
    # for i in range (0,len(course_details_list)):
    #     #course_day = (CourseDay.query.with_entities(CourseDay.day).join(Course).filter(CourseDay.course_id == int(course_details_list[i]['course_id'])).all())
    #     print(course_day)
    #     out = [item for t in course_day for item in t]
    #     course_details_list[i]['course_days'] = out
    return make_response((serialize_message_dashboard(course_details_list)), 200)


@student.route('getFeedback', methods=["POST"])
def get_feedback():
    return make_response("Your Feedback has been received anonymously", 200)
