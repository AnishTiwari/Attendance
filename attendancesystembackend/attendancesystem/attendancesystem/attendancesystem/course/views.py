from flask import Blueprint, request, jsonify, make_response
from sqlalchemy.orm import load_only

from ..student.models import *
from ..student.types import *

course = Blueprint('course', __name__)

# API: course-profile dashboard page
@course.route('getCourseSchedule/<variable>', methods=["GET"])
def get_course_schedule(variable):

    fields = ['latitude', 'longitude']
    loc = db.session.query(Course).filter(Course.course_code == variable).options(load_only(*fields)).all()

    db_val = db.session.query(Schedule).join(Course,Schedule.courses).filter(Course.course_code == variable).all()
    schd_schema = CourseScheduleSchema(many=True)
    post_json = schd_schema.dump(db_val)
    print(post_json)
    print(loc[0].latitude)

    return jsonify({"data": post_json, "latitude": loc[0].latitude, "longitude": loc[0].longitude})


@course.route('updateLocation', methods=["POST"])
def update_course_location():
    data = request.json
    print(data)
    res = db.session.query(Course).filter(Course.course_code == data['course_code']).update({"latitude": data['latitude'],
                                                                                       "longitude": data['longitude']})

    if not res:
        return make_response(db.error, 410)
    else:
        db.session.commit()
        return jsonify({"data": "Updated location"})


@course.route('getstudents/<course_code>', methods=["GET"])
def get_course_students(course_code):
    fields = ['username', 'rollno']
    data = User.query.join(User.courses).filter(Course.course_code == course_code).options(load_only(*fields)).all()
    print(data)
    json = StudentsSchema(many=True)
    val = json.dump(data)
    return jsonify({"data":val})


@course.route('getCourseFeedbacks/<course_code>', methods=["GET"])
def get_course_feedbacks(course_code):
    fields = ['rating', 'comment']
    data = db.session.query(Feedback).filter(Feedback.course_code == course_code).options(load_only(*fields)).all()
    print(data)
    json = CourseFeedbackSchema(many=True)
    val = json.dump(data)
    return jsonify({"data": val})
