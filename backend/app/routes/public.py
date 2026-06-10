from flask import Blueprint, jsonify, current_app

bp = Blueprint("public", __name__, url_prefix="/api")

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "env": current_app.config.get("ENV", "unknown")} ), 200

@bp.route("/version", methods=["GET"])
def version():
    return jsonify({"name": "SecureMoney", "version": "0.1.0"}), 200
