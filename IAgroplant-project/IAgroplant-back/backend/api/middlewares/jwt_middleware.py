from django.http import JsonResponse

from domains.auth.domain.services.token_service import TokenService
from domains.auth.infrastructure.persistence.postgres_auth_repository import PostgresAuthRepository



PUBLIC_ROUTES = [

    "/api/auth/login",

    "/api/auth/refresh",

    "/api/diagnostic/",

    "/admin/",

]



class JWTMiddleware:


    def __init__(self, get_response):

        self.get_response = get_response



    def __call__(self, request):


        print("==============================")
        print("JWT MIDDLEWARE")
        print("PATH:", request.path)
        print("METHOD:", request.method)
        print(
            "AUTH:",
            request.headers.get("Authorization")
        )
        print("==============================")


        # Rotas públicas

        if any(
            request.path.startswith(route)
            for route in PUBLIC_ROUTES
        ):

            print("ROTA PUBLICA")

            return self.get_response(request)



        auth_header = request.headers.get(
            "Authorization",
            ""
        )


        if not auth_header.startswith("Bearer "):

            print("TOKEN AUSENTE")


            return JsonResponse(

                {
                    "detail":
                    "Token não fornecido."
                },

                status=401

            )



        token = auth_header.split(" ")[1]



        try:


            payload = TokenService.decode_token(
                token
            )


            if not TokenService.is_access_token(
                payload
            ):

                return JsonResponse(

                    {
                        "detail":
                        "Token inválido."
                    },

                    status=401

                )



            repo = PostgresAuthRepository()


            user = repo.find_by_id(
                payload["sub"]
            )



            if not user or not user.is_active:


                return JsonResponse(

                    {
                        "detail":
                        "Usuário não encontrado."
                    },

                    status=401

                )



            request.current_user = user



        except ValueError as e:


            return JsonResponse(

                {
                    "detail":
                    str(e)
                },

                status=401

            )



        return self.get_response(request)