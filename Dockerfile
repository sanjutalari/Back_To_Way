FROM python:3.11-slim

WORKDIR /app

# Install OS-level build deps required by some Python packages (psycopg2, etc.)
# Also upgrade pip/setuptools/wheel so binary wheels are preferred when available.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends build-essential libpq-dev gcc \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel

# Install Python dependencies from the backend-flask folder
COPY backend-flask/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend-flask/ .

ENV FLASK_APP=app:app
ENV PYTHONUNBUFFERED=1

# Apply migrations, then bind Gunicorn to Render's dynamic PORT.
CMD ["sh", "-c", "flask db upgrade && gunicorn --bind 0.0.0.0:${PORT:-10000} app:app"]
