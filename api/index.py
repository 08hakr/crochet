import sys
import os

# Vercel sets up /var/task as the function directory
# Add backend to path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from main import create_app
    app = create_app()
except Exception as e:
    import traceback
    traceback.print_exc()
    # Minimal error app so Vercel at least deploys
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'error', 'message': str(e)})
