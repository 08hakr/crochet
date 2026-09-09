from flask import Blueprint, request, jsonify, send_file
from models import db, CartItem, Product, Order, OrderItem, SiteSetting
from utils.auth import token_required, admin_required
from io import BytesIO
import base64
import json

checkout_bp = Blueprint('checkout', __name__, url_prefix='/api/checkout')

@checkout_bp.route('', methods=['POST'])
@token_required
def create_order():
    cart_items = CartItem.query.filter_by(user_id=request.current_user.id).all()
    
    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400
    
    for item in cart_items:
        if not item.product:
            return jsonify({'error': 'Invalid product in cart'}), 400
        if item.product.stock < item.quantity:
            return jsonify({'error': f'Not enough stock for {item.product.name}'}), 400
    
    total = sum(item.quantity * item.product.price for item in cart_items)
    
    order = Order(
        user_id=request.current_user.id,
        total=total,
        status='pending'
    )
    db.session.add(order)
    db.session.flush()
    
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price
        )
        db.session.add(order_item)
        item.product.stock -= item.quantity
    
    CartItem.query.filter_by(user_id=request.current_user.id).delete()
    
    db.session.commit()
    
    qr_setting = SiteSetting.query.filter_by(key='qr_image_blob').first()
    qr_data = None
    if qr_setting and qr_setting.value:
        qr_data = qr_setting.value
    
    return jsonify({
        'order': order.to_dict(),
        'qr_code': qr_data
    }), 201

@checkout_bp.route('/<int:order_id>/upload-screenshot', methods=['POST'])
@token_required
def upload_payment_screenshot(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.user_id != request.current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if order.status != 'pending':
        return jsonify({'error': 'Order is not pending payment'}), 400
    
    file = request.files.get('screenshot')
    if not file or not file.filename:
        return jsonify({'error': 'Screenshot file is required'}), 400
    
    shipping_address = request.form.get('shipping_address')
    if shipping_address:
        try:
            json.loads(shipping_address)
            order.shipping_address = shipping_address
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid shipping address format'}), 400
    
    order.payment_screenshot_blob = file.read()
    order.payment_screenshot_mime = file.mimetype
    order.status = 'paid'
    db.session.commit()
    
    return jsonify({
        'message': 'Payment screenshot uploaded successfully',
        'order': order.to_dict()
    })

@checkout_bp.route('/my-orders', methods=['GET'])
@token_required
def get_my_orders():
    orders = Order.query.filter_by(user_id=request.current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]})

@checkout_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    if order.user_id != request.current_user.id and not request.current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({'order': order.to_dict(include_screenshot=True)})

# Admin order management
@checkout_bp.route('/admin/orders', methods=['GET'])
@admin_required
def get_all_orders():
    status = request.args.get('status')
    query = Order.query.order_by(Order.created_at.desc())
    if status:
        query = query.filter_by(status=status)
    orders = query.all()
    return jsonify({'orders': [o.to_dict(include_screenshot=True) for o in orders]})

@checkout_bp.route('/admin/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    valid_statuses = ['pending', 'paid', 'shipped', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    order.status = data['status']
    db.session.commit()
    return jsonify({'order': order.to_dict(include_screenshot=True)})

@checkout_bp.route('/qr-image', methods=['GET'])
def get_qr_image():
    qr_setting = SiteSetting.query.filter_by(key='qr_image_blob').first()
    if not qr_setting or not qr_setting.value:
        return jsonify({'error': 'QR code not set'}), 404
    
    # qr_setting.value stores base64 string
    image_data = base64.b64decode(qr_setting.value)
    mime_setting = SiteSetting.query.filter_by(key='qr_image_mime').first()
    mime = mime_setting.value if mime_setting else 'image/png'
    
    return send_file(BytesIO(image_data), mimetype=mime)