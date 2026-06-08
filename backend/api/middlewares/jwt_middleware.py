from django.http import JsonResponse
from domains.auth.domain.services.token_service import TokenService
from domains.auth.infrastructure.persistence.supabase_auth_repository import SupabaseAuthRepository

# Rotas que NÃO precisam de autenticação
PUBLIC_ROUTES = [
    "/auth/login",
    "/auth/refresh",
    "/admin/",
]


class JWTMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Libera rotas públicas
        if any(request.path.startswith(route) for route in PUBLIC_ROUTES):
            return self.get_response(request)

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return JsonResponse(
                {"detail": "Token não fornecido."},
                status=401,
            )

        token = auth_header.split(" ")[1]

        try:
            payload = TokenService.decode_token(token)

            if not TokenService.is_access_token(payload):
                return JsonResponse({"detail": "Token inválido."}, status=401)

            # Injeta o usuário no request para uso nas views
            repo = SupabaseAuthRepository()
            user = repo.find_by_id(payload["sub"])

            if not user or not user.is_active:
                return JsonResponse({"detail": "Usuário não encontrado."}, status=401)

            request.current_user = user

        except ValueError as e:
            return JsonResponse({"detail": str(e)}, status=401)

        return self.get_response(request)
