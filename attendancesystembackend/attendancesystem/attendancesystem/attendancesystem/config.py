import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):

    # general configs
    FRONTEND_URL = "29c0b7af1046.ngrok.io"
    # Database --------------------------

    SQLALCHEMY_DATABASE_URI = "mysql://root:@localhost/attendancesystem"
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    SESSION_PERMANENT = False
    SESSION_TYPE = 'filesystem'
    # --------------------------------------------
