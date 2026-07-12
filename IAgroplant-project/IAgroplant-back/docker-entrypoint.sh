#!/bin/bash

set -e


echo "================================="
echo "Aguardando PostgreSQL..."
echo "================================="


while ! nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 1
done


echo "================================="
echo "PostgreSQL disponível!"
echo "================================="


echo "Aplicando migrations..."

python manage.py migrate --noinput


echo "================================="
echo "Preparação concluída!"
echo "================================="


exec "$@"