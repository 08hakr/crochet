from flask import Blueprint, request, jsonify, make_response
from models import db, User
from utils.auth import generate_tokens, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    access_token, refresh_token = generate_tokens(user.id)
    
    response = make_response(jsonify({
        'message': 'Registered successfully',
        'user': user.to_dict()
    }))
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=15*60)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax', max_age=7*24*60*60)
    return response, 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token, refresh_token = generate_tokens(user.id)
    
    response = make_response(jsonify({
        'message': 'Logged in successfully',
        'user': user.to_dict()
    }))
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=15*60)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax', max_age=7*24*60*60)
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.set_cookie('access_token', '', httponly=True, secure=False, samesite='Lax', max_age=0)
    response.set_cookie('refresh_token', '', httponly=True, secure=False, samesite='Lax', max_age=0)
    return response

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    from utils.auth import decode_token, get_refresh_token_from_request
    
    refresh_token = get_refresh_token_from_request()
    if not refresh_token:
        return jsonify({'error': 'Refresh token missing'}), 401
    
    payload = decode_token(refresh_token)
    if not payload or payload.get('type') != 'refresh':
        return jsonify({'error': 'Invalid refresh token'}), 401
    
    user = db.session.get(User, payload['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 401
    
    access_token, new_refresh_token = generate_tokens(user.id)
    
    response = make_response(jsonify({
        'message': 'Token refreshed',
        'user': user.to_dict()
    }))
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=15*60)
    response.set_cookie('refresh_token', new_refresh_token, httponly=True, secure=False, samesite='Lax', max_age=7*24*60*60)
    return response

@auth_bp.route('/me', methods=['GET'])
@token_required
def me():
    return jsonify({'user': request.current_user.to_dict()})