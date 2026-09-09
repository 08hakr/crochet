import jwt
from datetime import datetime, timedelta
from flask import current_app, request, jsonify
from functools import wraps
from models import db, User

def generate_tokens(user_id):
    access_payload = {
        'user_id': user_id,
        'type': 'access',
        'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }
    refresh_payload = {
        'user_id': user_id,
        'type': 'refresh',
        'exp': datetime.utcnow() + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }
    access_token = jwt.encode(access_payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return access_token, refresh_token

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_token_from_request():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return request.cookies.get('access_token')

def get_refresh_token_from_request():
    return request.cookies.get('refresh_token')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        payload = decode_token(token)
        if not payload or payload.get('type') != 'access':
            return jsonify({'error': 'Token is invalid or expired'}), 401
        user = db.session.get(User, payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        payload = decode_token(token)
        if not payload or payload.get('type') != 'access':
            return jsonify({'error': 'Token is invalid or expired'}), 401
        user = db.session.get(User, payload['user_id'])
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        if token:
            payload = decode_token(token)
            if payload and payload.get('type') == 'access':
                user = db.session.get(User, payload['user_id'])
                if user:
                    request.current_user = user
        return f(*args, **kwargs)
    return decorated