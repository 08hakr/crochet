FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONUNBUFFERED=1

EXPOSE 7860

CMD ["gunicorn", "flask_app:app", "--bind", "0.0.0.0:7860", "--workers", "2", "--timeout", "120"]
