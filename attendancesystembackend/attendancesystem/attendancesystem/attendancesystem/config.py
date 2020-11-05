
import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):

    # Database --------------------------

    SQLALCHEMY_DATABASE_URI = "mysql://root:@localhost/attendancesystem"
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    # --------------------------------------------
