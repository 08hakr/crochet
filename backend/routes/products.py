from flask import Blueprint, request, jsonify, send_file
from models import db, Product, Category, ProductImage
from utils.auth import token_required, admin_required, optional_token
import base64
from io import BytesIO

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('', methods=['GET'])
@optional_token
def get_products():
    category_id = request.args.get('category_id', type=int)
    query = Product.query
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    products = query.order_by(Product.created_at.desc()).all()
    return jsonify({'products': [p.to_dict(include_image=True) for p in products]})

@products_bp.route('/<int:product_id>', methods=['GET'])
@optional_token
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict(include_image=True)})

@products_bp.route('/image/<int:product_id>', methods=['GET'])
def get_product_image(product_id):
    product = db.session.get(Product, product_id)
    if not product or not product.image_blob:
        return jsonify({'error': 'Image not found'}), 404
    return send_file(
        BytesIO(product.image_blob),
        mimetype=product.image_mime or 'image/jpeg'
    )

# Admin routes
@products_bp.route('', methods=['POST'])
@admin_required
def create_product():
    data = request.form
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    price = data.get('price', type=float)
    category_id = data.get('category_id', type=int)
    stock = data.get('stock', 0, type=int)
    
    if not name or price is None:
        return jsonify({'error': 'Name and price are required'}), 400
    
    product = Product(
        name=name,
        description=description,
        price=price,
        category_id=category_id if category_id else None,
        stock=stock
    )
    
    image_file = request.files.get('image')
    if image_file and image_file.filename:
        product.image_blob = image_file.read()
        product.image_mime = image_file.mimetype
    
    db.session.add(product)
    db.session.flush()

    images = request.files.getlist('images')
    for idx, img in enumerate(images):
        if img and img.filename:
            product.images.append(ProductImage(
                image_blob=img.read(),
                image_mime=img.mimetype,
                display_order=idx
            ))
    
    db.session.commit()
    return jsonify({'product': product.to_dict(include_image=True)}), 201

@products_bp.route('/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.form
    if 'name' in data:
        product.name = data['name'].strip()
    if 'description' in data:
        product.description = data['description'].strip()
    if 'price' in data:
        product.price = float(data['price'])
    if 'category_id' in data:
        product.category_id = int(data['category_id']) if data['category_id'] else None
    if 'stock' in data:
        product.stock = int(data['stock'])
    
    image_file = request.files.get('image')
    if image_file and image_file.filename:
        product.image_blob = image_file.read()
        product.image_mime = image_file.mimetype

    if data.get('remove_images') == 'true':
        ProductImage.query.filter_by(product_id=product.id).delete()

    images = request.files.getlist('images')
    if images and any(img and img.filename for img in images):
        for idx, img in enumerate(images):
            if img and img.filename:
                product.images.append(ProductImage(
                    image_blob=img.read(),
                    image_mime=img.mimetype,
                    display_order=idx
                ))
    
    db.session.commit()
    return jsonify({'product': product.to_dict(include_image=True)})

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted'})

# Categories
@products_bp.route('/categories', methods=['GET'])
@optional_token
def get_categories():
    categories = Category.query.order_by(Category.display_order, Category.name).all()
    return jsonify({'categories': [c.to_dict() for c in categories]})

@products_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    name = data.get('name', '').strip()
    display_order = data.get('display_order', 0)
    
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
    
    if Category.query.filter_by(name=name).first():
        return jsonify({'error': 'Category already exists'}), 400
    
    category = Category(name=name, display_order=display_order)
    db.session.add(category)
    db.session.commit()
    return jsonify({'category': category.to_dict()}), 201

@products_bp.route('/categories/<int:category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'name' in data:
        name = data['name'].strip()
        if not name:
            return jsonify({'error': 'Category name cannot be empty'}), 400
        if Category.query.filter(Category.name == name, Category.id != category_id).first():
            return jsonify({'error': 'Category name already exists'}), 400
        category.name = name
    if 'display_order' in data:
        category.display_order = int(data['display_order'])
    
    db.session.commit()
    return jsonify({'category': category.to_dict()})

@products_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    if category.products:
        return jsonify({'error': 'Cannot delete category with products'}), 400
    
    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted'})