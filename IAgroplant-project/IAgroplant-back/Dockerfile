FROM python:3.12-slim


WORKDIR /app


RUN apt-get update \
    && apt-get install -y netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*


RUN pip install --upgrade pip


COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt


COPY . .


COPY docker-entrypoint.sh /app/docker-entrypoint.sh


RUN chmod +x /app/docker-entrypoint.sh


EXPOSE 8000


ENTRYPOINT ["/app/docker-entrypoint.sh"]


CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]