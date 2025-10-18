from flask import Flask
from .config import Config
from .extensions import close_db, get_db
from .api.auth_api import auth_bp
from .api.admin_api import admin_bp
from .api.patient_api import patient_bp
from .api.doctor_api import doctor_bp
from .api.caretaker_api import caretaker_bp
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # register teardown to close DB
    app.teardown_appcontext(close_db)

    # register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    app.register_blueprint(patient_bp, url_prefix="/api/patient")

    app.register_blueprint(doctor_bp, url_prefix="/api/doctor")

    app.register_blueprint(caretaker_bp, url_prefix="/api/caretaker")

    # simple test route
    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app
