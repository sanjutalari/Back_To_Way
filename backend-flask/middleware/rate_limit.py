import time
from collections import defaultdict
from functools import wraps

from flask import jsonify, request


class RateLimiter:
    _limits = {}

    @classmethod
    def init_app(cls, app):
        app.before_request(cls._check_rate_limit)

    @classmethod
    def _check_rate_limit(cls):
        path = request.path
        if not path.startswith("/api/"):
            return None
        if request.method == "GET":
            return cls._enforce("default_get", 60, 60)
        return cls._enforce("default_post", 20, 60)

    @classmethod
    def _enforce(cls, key, max_requests, window_seconds):
        client_ip = request.remote_addr or "unknown"
        now = time.time()
        bucket_key = (key, client_ip)

        if bucket_key not in cls._limits:
            cls._limits[bucket_key] = []

        timestamps = cls._limits[bucket_key]
        cutoff = now - window_seconds
        timestamps[:] = [t for t in timestamps if t > cutoff]

        if len(timestamps) >= max_requests:
            return jsonify({
                "success": False,
                "message": f"Rate limit exceeded. Try again in {window_seconds} seconds."
            }), 429

        timestamps.append(now)
        cls._limits[bucket_key] = timestamps
        return None


def rate_limit(max_requests=30, window_seconds=60):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            client_ip = request.remote_addr or "unknown"
            now = time.time()
            key = (f.__name__, client_ip)
            if not hasattr(decorated, "_timestamps"):
                decorated._timestamps = defaultdict(list)
            timestamps = decorated._timestamps[key]
            cutoff = now - window_seconds
            timestamps[:] = [t for t in timestamps if t > cutoff]
            if len(timestamps) >= max_requests:
                return jsonify({
                    "success": False,
                    "message": f"Rate limit exceeded. Try again in {window_seconds} seconds."
                }), 429
            timestamps.append(now)
            return f(*args, **kwargs)
        return decorated
    return decorator
