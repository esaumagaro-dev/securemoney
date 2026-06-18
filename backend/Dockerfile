FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN addgroup --system app && adduser --system --ingroup app app
USER app

EXPOSE 8000
CMD ["uvicorn", "run:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
