from datetime import datetime, timezone, timedelta
from typing import List, Optional
from domains.posts.domain.entities.post import Post
from domains.posts.domain.repositories.post_repository import PostRepository


class PostgresPostRepository(PostRepository):
    _posts: List[Post] = []
    _initialized = False

    def __init__(self):
        if not PostgresPostRepository._initialized:
            self._prepopulate_mock_data()
            PostgresPostRepository._initialized = True

    def _prepopulate_mock_data(self):
        now = datetime.now(timezone.utc)

        # Post 1: Diagnóstico - Fernanda Luz (Piauí)
        p1 = Post(
            id="post-1",
            type="diagnostic",
            content="Diagnóstico em soja no Piauí: identificado Phakopsora pachyrhizi (ferrugem asiática) em estágio inicial. Recomendo triazol + estrobilurina. Incidência estimada: 18%.",
            image_url="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
            tags=["Soja", "Ferrugem Asiática", "Fungicida"],
            author_id="user-fernanda",
            author_name="Dra. Fernanda Luz",
            author_role="Agrônoma",
            author_initials="FL",
            author_verified=True,
            region="Piauí",
            likes=["user-2", "user-3"],  # Curtidas simuladas
            comments_count=31,
            created_at=now - timedelta(hours=2),
            pathogen="Phakopsora pachyrhizi",
            severity="Moderada",
        )

        # Post 2: Simples - Carlos Mendes (Bahia)
        p2 = Post(
            id="post-2",
            type="simple",
            content="Ótimo resultado com gotejamento subsuperficial no milho! −35% no consumo hídrico e +20% na produtividade vs. aspersão convencional.",
            image_url="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=80",
            tags=["Milho", "Irrigação", "Gotejamento"],
            author_id="user-carlos",
            author_name="Carlos Mendes",
            author_role="Técnico Agrícola",
            author_initials="CM",
            author_verified=True,
            region="Bahia",
            likes=["user-1"],
            comments_count=24,
            created_at=now - timedelta(hours=4),
        )

        # Post 3: Vaga/Oportunidade - Fazenda Boa Vista (Mato Grosso)
        p3 = Post(
            id="post-3",
            type="opportunity",
            content="Estamos contratando! Estagiário em Agronomia para manejo de culturas de grãos.",
            image_url=None,
            tags=["Estágio", "Agronomia", "Grãos"],
            author_id="demo-producer-1",
            author_name="Fazenda Boa Vista",
            author_role="Empresa Agrícola",
            author_initials="BV",
            author_verified=False,
            region="Mato Grosso",
            likes=[],
            comments_count=18,
            created_at=now - timedelta(hours=6),
            salary="R$ 1.200/mês + benefícios",
            duration="12 meses",
        )

        # Post 4: Diagnóstico - Roberto Alves (Mato Grosso)
        p4 = Post(
            id="post-4",
            type="diagnostic",
            content="Mancha foliar em algodão: provável Cercospora gossypina. Condições favoráveis à progressão. Recomendo cúpricos.",
            image_url="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
            tags=["Algodão", "Cercospora", "Manejo"],
            author_id="user-roberto",
            author_name="Dr. Roberto Alves",
            author_role="Fitopatologista",
            author_initials="RA",
            author_verified=True,
            region="Mato Grosso",
            likes=["user-1", "user-2", "user-3"],
            comments_count=45,
            created_at=now - timedelta(hours=8),
            pathogen="Cercospora gossypina",
            severity="Alta",
        )

        # Post 5: Simples - Ana Paula Costa (Goiás)
        p5 = Post(
            id="post-5",
            type="simple",
            content="Alguém tem experiência com consórcio milho + Brachiaria ruziziensis? Quero testar ILP em 150 ha no cerrado.",
            image_url=None,
            tags=["ILP", "Milho", "Braquiária", "Cerrado"],
            author_id="user-ana",
            author_name="Ana Paula Costa",
            author_role="Produtora Rural",
            author_initials="AP",
            author_verified=False,
            region="Goiás",
            likes=[],
            comments_count=42,
            created_at=now - timedelta(hours=12),
        )

        # Post 6: Vaga/Oportunidade - Cooperativa AgroNorte (Pará)
        p6 = Post(
            id="post-6",
            type="opportunity",
            content="Vaga para Agrônomo pleno. Acompanhamento de 80 associados em soja e milho. CREA ativo exigido.",
            image_url=None,
            tags=["Agronomia", "CREA", "Cooperativa"],
            author_id="user-coopnorte",
            author_name="Cooperativa AgroNorte",
            author_role="Cooperativa",
            author_initials="AN",
            author_verified=True,
            region="Pará",
            likes=["user-2"],
            comments_count=27,
            created_at=now - timedelta(days=1),
            salary="R$ 5.800/mês + PLR",
            duration="CLT",
        )

        PostgresPostRepository._posts.extend([p1, p2, p3, p4, p5, p6])

    def save(self, post: Post) -> Post:
        for idx, p in enumerate(PostgresPostRepository._posts):
            if p.id == post.id:
                PostgresPostRepository._posts[idx] = post
                return post
        PostgresPostRepository._posts.insert(0, post)  # Novo post no topo
        return post

    def get_by_id(self, post_id: str) -> Optional[Post]:
        for p in PostgresPostRepository._posts:
            if p.id == post_id:
                return p
        return None

    def list_posts(self, filter_category: Optional[str] = None) -> List[Post]:
        posts = PostgresPostRepository._posts[:]
        if filter_category and filter_category != "Todos":
            # Mapeamento do mobile: 'Diagnóstico IA' -> 'diagnostic', 'Vagas' -> 'opportunity', 'Manejo' -> 'simple', etc.
            category_map = {
                "Diagnóstico IA": "diagnostic",
                "Vagas": "opportunity",
            }
            mapped_type = category_map.get(filter_category, "simple")
            posts = [p for p in posts if p.type == mapped_type]

        # Ordenar decrescente por data de criação
        posts.sort(key=lambda p: p.created_at, reverse=True)
        return posts

    def like_post(self, post_id: str, user_id: str) -> bool:
        post = self.get_by_id(post_id)
        if post and user_id not in post.likes:
            post.likes.append(user_id)
            return True
        return False

    def unlike_post(self, post_id: str, user_id: str) -> bool:
        post = self.get_by_id(post_id)
        if post and user_id in post.likes:
            post.likes.remove(user_id)
            return True
        return False
