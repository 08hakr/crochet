from flask import Blueprint, request, jsonify
from models import db, SiteSetting, User
from utils.auth import admin_required
import base64

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

PUBLIC_SETTINGS_KEYS = ['hero_title', 'hero_subtitle', 'about_text', 'contact_email', 'contact_phone', 'contact_instagram', 'contact_address']

DEFAULT_SETTINGS = {
    'hero_title': 'Handcrafted Crochet Creations',
    'hero_subtitle': 'Beautiful handmade items made with love',
    'about_text': 'Welcome to our crochet shop! We create unique, handcrafted crochet items including amigurumi, wearables, and home decor. Each piece is made with care and attention to detail.',
    'contact_info': 'Email: contact@crochetbusiness.com\nPhone: +91 98765 43210\nInstagram: @crochetbusiness',
    'contact_email': 'contact@crochetbusiness.com',
    'contact_phone': '+91 98765 43210',
    'contact_instagram': '@crochetbusiness',
    'contact_address': '',
    'qr_image_blob': '',
    'qr_image_mime': ''
}

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email, is_admin=True).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid admin credentials'}), 401
    
    from utils.auth import generate_tokens
    access_token, refresh_token = generate_tokens(user.id)
    
    from flask import make_response
    response = make_response(jsonify({
        'message': 'Admin login successful',
        'user': user.to_dict()
    }))
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='Lax', max_age=15*60)
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=False, samesite='Lax', max_age=7*24*60*60)
    return response

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    from models import Product, Order, Category
    total_products = Product.query.count()
    total_categories = Category.query.count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status='pending').count()
    paid_orders = Order.query.filter_by(status='paid').count()
    total_revenue = db.session.query(db.func.sum(Order.total)).filter(Order.status.in_(['paid', 'shipped'])).scalar() or 0
    
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    
    return jsonify({
        'stats': {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'paid_orders': paid_orders,
            'total_revenue': total_revenue
        },
        'recent_orders': [o.to_dict() for o in recent_orders]
    })

@admin_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    settings = {}
    for key in DEFAULT_SETTINGS:
        setting = SiteSetting.query.filter_by(key=key).first()
        settings[key] = setting.value if setting else DEFAULT_SETTINGS[key]
    return jsonify({'settings': settings})

@admin_bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    for key, value in data.items():
        if key not in DEFAULT_SETTINGS:
            continue
        setting = SiteSetting.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = SiteSetting(key=key, value=value)
            db.session.add(setting)
    
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully'})

@admin_bp.route('/upload-qr', methods=['POST'])
@admin_required
def upload_qr():
    file = request.files.get('qr_image')
    if not file or not file.filename:
        return jsonify({'error': 'QR image file is required'}), 400
    
    image_data = file.read()
    base64_data = base64.b64encode(image_data).decode()
    
    blob_setting = SiteSetting.query.filter_by(key='qr_image_blob').first()
    if blob_setting:
        blob_setting.value = base64_data
    else:
        blob_setting = SiteSetting(key='qr_image_blob', value=base64_data)
        db.session.add(blob_setting)
    
    mime_setting = SiteSetting.query.filter_by(key='qr_image_mime').first()
    if mime_setting:
        mime_setting.value = file.mimetype
    else:
        mime_setting = SiteSetting(key='qr_image_mime', value=file.mimetype)
        db.session.add(mime_setting)
    
    db.session.commit()
    return jsonify({'message': 'QR code uploaded successfully'})

@admin_bp.route('/init-default-admin', methods=['POST'])
def init_default_admin():
    if User.query.filter_by(email='admin').first():
        return jsonify({'error': 'Admin already exists'}), 400
    
    admin = User(email='admin', is_admin=True)
    admin.set_password('admin')
    db.session.add(admin)
    db.session.commit()
    return jsonify({'message': 'Default admin created (admin/admin)'}), 201

@admin_bp.route('/init-settings', methods=['POST'])
@admin_required
def init_settings():
    for key, value in DEFAULT_SETTINGS.items():
        if not SiteSetting.query.filter_by(key=key).first():
            setting = SiteSetting(key=key, value=value)
            db.session.add(setting)
    db.session.commit()
    return jsonify({'message': 'Default settings initialized'})

@admin_bp.route('/settings/public', methods=['GET'])
def get_public_settings():
    settings = {}
    for key in PUBLIC_SETTINGS_KEYS:
        setting = SiteSetting.query.filter_by(key=key).first()
        if setting:
            settings[key] = setting.value
        elif key in DEFAULT_SETTINGS:
            settings[key] = DEFAULT_SETTINGS[key]
    return jsonify({'settings': settings})