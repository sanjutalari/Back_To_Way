FROM python:3.13-slim

WORKDIR /app

# Install Python dependencies from the backend-flask folder
COPY backend-flask/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend-flask/ .

# Use gunicorn to run the Flask app (app:app should point to backend-flask/app.py)
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
