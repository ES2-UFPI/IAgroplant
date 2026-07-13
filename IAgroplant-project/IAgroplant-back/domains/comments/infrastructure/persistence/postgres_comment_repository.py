from datetime import datetime, timezone, timedelta
from typing import List
from domains.comments.domain.entities.comment import Comment
from domains.comments.domain.repositories.comment_repository import CommentRepository


class PostgresCommentRepository(CommentRepository):
    _comments: List[Comment] = []
    _initialized = False

    def __init__(self):
        if not PostgresCommentRepository._initialized:
            self._prepopulate_mock_data()
            PostgresCommentRepository._initialized = True

    def _prepopulate_mock_data(self):
        now = datetime.now(timezone.utc)

        # Comentários no Post 1 (Diagnóstico - Dra. Fernanda Luz)
        c1 = Comment(
            id="comment-1",
            post_id="post-1",
            author_id="user-carlos",
            author_name="Carlos Mendes",
            author_role="Técnico Agrícola",
            author_initials="CM",
            content="Excelente diagnóstico, Dra. Fernanda! Aqui na Bahia também temos visto incidência crescente de ferrugem asiática nesta safra.",
            created_at=now - timedelta(hours=1, minutes=30),
        )

        c2 = Comment(
            id="comment-2",
            post_id="post-1",
            author_id="user-ana",
            author_name="Ana Paula Costa",
            author_role="Produtora Rural",
            author_initials="AP",
            content="Qual o intervalo de reaplicação recomendado para o fungicida?",
            created_at=now - timedelta(hours=1),
        )

        # Comentário no Post 2 (Simples - Carlos Mendes)
        c3 = Comment(
            id="comment-3",
            post_id="post-2",
            author_id="user-roberto",
            author_name="Dr. Roberto Alves",
            author_role="Fitopatologista",
            author_initials="RA",
            content="Ótima economia de água! Vocês monitoraram algum impacto na compactação do solo com o gotejamento subsuperficial?",
            created_at=now - timedelta(hours=3),
        )

        PostgresCommentRepository._comments.extend([c1, c2, c3])

    def save(self, comment: Comment) -> Comment:
        for idx, c in enumerate(PostgresCommentRepository._comments):
            if c.id == comment.id:
                PostgresCommentRepository._comments[idx] = comment
                return comment
        PostgresCommentRepository._comments.append(comment)
        return comment

    def list_by_post(self, post_id: str) -> List[Comment]:
        return [c for c in PostgresCommentRepository._comments if c.post_id == post_id]

    def count_by_post(self, post_id: str) -> int:
        return len(self.list_by_post(post_id))
