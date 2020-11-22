from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import os
from . import config
from flask_migrate import Migrate


app = Flask(__name__)
# config.py configuration
app.config.from_object(config.Config)
app.config['SQLALCHEMY_ECHO'] = True

db = SQLAlchemy()
db.init_app(app)


# initialise db

migrate = Migrate(app, db)


from attendancesystem.attendancesystem.student.views import student     # nopep8
from attendancesystem.attendancesystem.staff.views import staff     # nopep8
from attendancesystem.attendancesystem.course.views import course     # nopep8

# config urls for module
app.register_blueprint(student, url_prefix='/')
app.register_blueprint(staff, url_prefix='/staff')
app.register_blueprint(course, url_prefix='/course')


#
# # all the middleware goes here..
# app.wsgi_app = middleware.SecurityMiddleware(app.wsgi_app)

# app.wsgi_app = middleware.SecurityMiddleware1(app.wsgi_app)
sk = os.environ.get('FLASK_SECRET_KEY')
app.secret_key = sk if sk else os.urandom(40)
db.init_app(app)


@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = 'https://14ff9b4ecb11.ngrok.io'
    header['Access-Control-Allow-Credentials'] = 'true'
    header["Access-Control-Allow-Headers"] = 'Origin, X-Requested-With, Content-Type, Accept'
    return response





