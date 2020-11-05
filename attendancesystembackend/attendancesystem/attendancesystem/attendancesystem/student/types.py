from marshmallow import fields, Schema


class FeedbackSchema(Schema):
    id = fields.Int(dump_only=True)
    rating = fields.Integer()
    comment = fields.Str()
    course_name = fields.Str()
