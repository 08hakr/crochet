from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
from config import Config
from models import db
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.checkout import checkout_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    app.config.from_object(Config)
    
    # CORS: allow production domain and local dev
    origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
    ]
    # Add Vercel domain if set
    vercel_url = os.environ.get('VERCEL_URL')
    if vercel_url:
        origins.append(f'https://{vercel_url}')
        origins.append(f'http://{vercel_url}')
    
    CORS(app, 
         supports_credentials=True,
         origins=origins,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    
    db.init_app(app)
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(admin_bp)
    
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path.startswith('api/'):
            return jsonify({'error': 'Not found'}), 404
        
        static_folder = app.static_folder
        if static_folder and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        
        index_path = os.path.join(static_folder, 'index.html') if static_folder else ''
        if index_path and os.path.exists(index_path):
            return send_from_directory(static_folder, 'index.html')
        
        return jsonify({'error': 'Frontend not built. Run `npm run build` in frontend directory'}), 404
    
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
