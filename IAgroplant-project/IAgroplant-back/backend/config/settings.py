from pathlib import Path

from decouple import config


# ------------------------------------------------------------------
# Base
# ------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ------------------------------------------------------------------
# Segurança
# ------------------------------------------------------------------

SECRET_KEY = config("SECRET_KEY")

DEBUG = config(
    "DEBUG",
    cast=bool,
    default=True
)
AI_PROVIDER = config(

    "AI_PROVIDER",

    default="fake"

)
ALLOWED_HOSTS = ["*"]


# ------------------------------------------------------------------
# Apps
# ------------------------------------------------------------------

INSTALLED_APPS = [

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # DRF
    "rest_framework",
]


# ------------------------------------------------------------------
# Middleware
# ------------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    "backend.api.middlewares.jwt_middleware.JWTMiddleware",
]


# ------------------------------------------------------------------
# URLs
# ------------------------------------------------------------------

ROOT_URLCONF = "backend.config.urls"


# ------------------------------------------------------------------
# Templates
# ------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ------------------------------------------------------------------
# WSGI / ASGI
# ------------------------------------------------------------------

WSGI_APPLICATION = "backend.config.wsgi.application"

ASGI_APPLICATION = "backend.config.asgi.application"


# ------------------------------------------------------------------
# Banco de Dados
# ------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST"),
        "PORT": config("DB_PORT"),
    }
}


# ------------------------------------------------------------------
# Internacionalização
# ------------------------------------------------------------------

LANGUAGE_CODE = "pt-br"

TIME_ZONE = "America/Fortaleza"

USE_I18N = True

USE_TZ = True


# ------------------------------------------------------------------
# Arquivos estáticos
# ------------------------------------------------------------------

STATIC_URL = "static/"


# ------------------------------------------------------------------
# Chave primária padrão
# ------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ------------------------------------------------------------------
# JWT
# ------------------------------------------------------------------

JWT_SECRET_KEY = config("JWT_SECRET_KEY")

JWT_ALGORITHM = config(
    "JWT_ALGORITHM",
    default="HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    config(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        default=15
    )
)

REFRESH_TOKEN_EXPIRE_DAYS = int(
    config(
        "REFRESH_TOKEN_EXPIRE_DAYS",
        default=7
    )
)


# ------------------------------------------------------------------
# Django REST Framework
# ------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
    ],
}