import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):

    # general configs
    FRONTEND_URL = "ab28256188a1.ngrok.io"
    # Database --------------------------
    SQLALCHEMY_DATABASE_URI = "mysql://root:@localhost/attendancesystem"
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    SESSION_PERMANENT = False
    SESSION_TYPE = 'filesystem'
    # --------------------------------------------

    # Certificate Media
    COURSE_CERTIFICATE_FOLDER = "coursefolder"
    PROFESSOR_CERTIFICATE_FOLDER = "professorfolder"
    STUDENT_CERTIFICATE_FOLDER = "studentfolder"

    # WKHTML path
    WKHTML_PATH = "E:/AttendanceSystem/attendancesystembackend/attendancesystem/media/wkhtmltopdf/bin/wkhtmltopdf.exe"
