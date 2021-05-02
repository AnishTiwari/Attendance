import os
import pdfkit

from flask import Blueprint, render_template
from flask import request, make_response, jsonify, session
from werkzeug.utils import secure_filename
import datetime

from ..config import Config
from .. import app

from ..student.models import *
from .models import Leave, db
from .types import *

leave = Blueprint("leave", __name__)


@leave.route("getallleaves", methods=["GET"])
def get_all_leaves():
    db_res = (db.session.query(Leave).filter(
        Leave.roll_no == session.get("user_rollno")).order_by(
            Leave.logged_time.desc()).all())

    homeschema = HomeLeaveSchema(many=True)
    res = homeschema.dump(db_res)
    return jsonify({"data": res})


def generate_leave_pdf(rollno, logged_time, leave_id):
    leave_row = (db.session.query(Leave).filter(
        Leave.roll_no == rollno).filter(
            Leave.logged_time == logged_time).filter(
                Leave.id == leave_id)).first()

    user_db = (db.session.query(User).filter(User.rollno == rollno)).first()
    if leave_row is not None:
        rendered = render_template(
            "leave_template.html",
            rollno=rollno,
            name=user_db.username,
            start_date=leave_row.start_date,
            end_date=leave_row.end_date,
            reason=leave_row.reason,
            additional_comments=leave_row.additional_comments,
            attachments=leave_row.filename,
            no_of_days=(leave_row.end_date - leave_row.start_date).days)
        print(rendered)
        config = pdfkit.configuration(wkhtmltopdf=Config.WKHTML_PATH)

        root_path = os.path.dirname(app.instance_path)
        media_path = root_path + '/media/' + Config.STUDENT_CERTIFICATE_FOLDER + '/' + rollno + '/'
        leave_folder = media_path + "leave_attachments/"
        filename = leave_folder + str(leave_row.id) + ".pdf"
        pdfkit.from_string(rendered,
                           filename,
                           options={
                               'page-size': 'A4',
                               'orientation': 'Landscape'
                           },
                           configuration=config)

        return True
    else:
        return False


@leave.route("manageleaves", methods=["GET"])
def manage_leaves():
    # TODO: filter based on tutorship
    db_res = (db.session.query(Leave).order_by(Leave.logged_time.desc()).all())

    homeschema = HomeLeaveSchema(many=True)
    res = homeschema.dump(db_res)
    return jsonify({"data": res})


@leave.route("statuschange", methods=["POST"])
def leave_status_change():
    rollno = request.form.get("rollno")
    logged_time = request.form.get("logged_time")
    leave_id = request.form.get("id")
    status = request.form.get("status")
    if status == "approve":
        status = "Approved"
    else:
        status = "Rejected"
    db_res = (db.session.query(Leave).filter(
        Leave.logged_time == logged_time).filter(
            Leave.roll_no == rollno).filter(Leave.id == leave_id)).first()

    if db_res is not None:
        db_res.status = status
        db.session.commit()
        if status == "Approved":
            if generate_leave_pdf(rollno, logged_time, leave_id):
                return jsonify({
                    "message": "Leave Status Changed",
                    "status": status
                })
            else:
                return jsonify({
                    "message": "Leave Couldn't Be " + status,
                    "status": "Error"
                })

        return jsonify({"message": "Leave Status Changed", "status": status})

    else:
        return jsonify({
            "message": "Leave Couldn't Be " + status + "ed",
            "status": "Error"
        })


@leave.route("/requestforleave", methods=["POST"])
def requestfor_leave():
    # store the attachments if any
    file = request.files["fileSource"]
    datetime_format = "%a %b %d %Y %X %Z%z (India Standard Time)"
    start_date = datetime.datetime.strptime(request.form.get("Start"),
                                            datetime_format)

    end_date = datetime.datetime.strptime(request.form.get("End"),
                                          datetime_format)
    reason = request.form.get("Reason")
    additional_comments = request.form.get("Additional_comments")
    rollno = session.get('user_rollno')
    filename = datetime.datetime.now().strftime(
        "%Y%m%d_%H%M%S") + secure_filename(file.filename)
    logged_time = datetime.datetime.now()
    status = "Pending"

    new_leave = Leave()
    new_leave.additional_comments = additional_comments
    new_leave.start_date = start_date
    new_leave.end_date = end_date
    new_leave.reason = reason
    new_leave.status = status
    new_leave.logged_time = logged_time
    new_leave.filename = filename
    new_leave.roll_no = int(rollno)

    db.session.add(new_leave)
    db.session.commit()

    if file is not None:
        root_path = os.path.dirname(app.instance_path)

        file.save(root_path + '/media/' + Config.STUDENT_CERTIFICATE_FOLDER +
                  "/" + rollno + "/leave_attachments/" + filename)

    return jsonify({"data": "Leave Applied"})
