from flask import Blueprint, jsonify, make_response


bp = Blueprint('api', __name__, url_prefix='/service')


@bp.route('/hello_world')
def hello_world():
    return make_response(jsonify(message='Hello World')), 200
