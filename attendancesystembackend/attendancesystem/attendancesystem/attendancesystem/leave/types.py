from marshmallow import fields, Schema


class LeaveSchema(Schema):
    id = fields.Int(dump_only=True)
    start_date = fields.DateTime()
    roll_no = fields.Integer()
    end_date = fields.DateTime()
    reason = fields.Str()
    additional_comments = fields.Str()
    logged_time = fields.DateTime()
    status = fields.Str()
    filename = fields.Str()

class HomeLeaveSchema(Schema):
    id = fields.Int(dump_only=True)
    start_date = fields.DateTime()
    roll_no = fields.Integer()
    end_date = fields.DateTime()
    reason = fields.Str()
    additional_comments = fields.Str()
    logged_time = fields.DateTime()
    status = fields.Str()
    filename = fields.Str()
