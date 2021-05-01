from attendancesystem.attendancesystem import db
from sqlalchemy.dialects.mysql import TIME


class Leave(db.Model):
    __tablename__ = "leave"
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime)
    roll_no = db.Column(db.Integer)
    end_date = db.Column(db.DateTime)
    reason = db.Column(db.String(50))
    additional_comments = db.Column(db.String(100))
    logged_time = db.Column(db.DateTime)
    status = db.Column(db.String(15))
    filename = db.Column(db.String(50))
