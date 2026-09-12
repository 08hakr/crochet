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
    # On Vercel backend-only, frontend/dist doesn't exist
    frontend_dist = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
    has_frontend = os.path.isdir(frontend_dist)

    app = Flask(__name__, static_folder=frontend_dist if has_frontend else None, static_url_path='')
    app.config.from_object(Config)

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(admin_bp)

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    if has_frontend:
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

            return jsonify({'error': 'Frontend not built'}), 404

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
