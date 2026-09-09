from flask import Blueprint, request, jsonify
from models import db, CartItem, Product
from utils.auth import token_required

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

def get_int(data, key, default=None):
    value = data.get(key, default)
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

@cart_bp.route('', methods=['GET'])
@token_required
def get_cart():
    cart_items = CartItem.query.filter_by(user_id=request.current_user.id).all()
    total = sum(item.quantity * item.product.price for item in cart_items if item.product)
    return jsonify({
        'items': [item.to_dict() for item in cart_items],
        'total': total,
        'count': sum(item.quantity for item in cart_items)
    })

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    product_id = get_int(data, 'product_id')
    quantity = get_int(data, 'quantity', 1)
    
    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400
    
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    if product.stock < quantity:
        return jsonify({'error': 'Not enough stock'}), 400
    
    cart_item = CartItem.query.filter_by(
        user_id=request.current_user.id,
        product_id=product_id
    ).first()
    
    if cart_item:
        new_quantity = cart_item.quantity + quantity
        if product.stock < new_quantity:
            return jsonify({'error': 'Not enough stock'}), 400
        cart_item.quantity = new_quantity
    else:
        cart_item = CartItem(
            user_id=request.current_user.id,
            product_id=product_id,
            quantity=quantity
        )
        db.session.add(cart_item)
    
    db.session.commit()
    return jsonify({'item': cart_item.to_dict()}), 201

@cart_bp.route('/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(item_id):
    cart_item = db.session.get(CartItem, item_id)
    if not cart_item or cart_item.user_id != request.current_user.id:
        return jsonify({'error': 'Cart item not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    quantity = get_int(data, 'quantity')
    if quantity is None or quantity < 1:
        return jsonify({'error': 'Valid quantity is required'}), 400
    
    if cart_item.product and cart_item.product.stock < quantity:
        return jsonify({'error': 'Not enough stock'}), 400
    
    cart_item.quantity = quantity
    db.session.commit()
    return jsonify({'item': cart_item.to_dict()})

@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(item_id):
    cart_item = db.session.get(CartItem, item_id)
    if not cart_item or cart_item.user_id != request.current_user.id:
        return jsonify({'error': 'Cart item not found'}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({'message': 'Item removed from cart'})

@cart_bp.route('', methods=['DELETE'])
@token_required
def clear_cart():
    CartItem.query.filter_by(user_id=request.current_user.id).delete()
    db.session.commit()
    return jsonify({'message': 'Cart cleared'})