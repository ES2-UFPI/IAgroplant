import bcrypt
import psycopg2
from decouple import config
from datetime import datetime, timezone, timedelta

def seed():
    # Gera o hash da senha 'password123' usando bcrypt
    password = "password123"
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # 1. Usuários padrão do aplicativo móvel
    users = [
        {
            "id": "demo-joao",
            "email": "joao.agro@exemplo.com",
            "name": "João Agricultor",
            "role": "Produtor Rural",
            "is_active": True,
            "password_hash": password_hash,
            "region": "Piauí",
            "certificado": True,
            "especialidades": []
        },
        {
            "id": "demo-arthur",
            "email": "arthur.estudante@exemplo.com",
            "name": "Arthur Estudante",
            "role": "Estudante",
            "is_active": True,
            "password_hash": password_hash,
            "region": "Piauí",
            "certificado": False,
            "especialidades": ["Soja", "Milho", "Fitopatologia"]
        },
        {
            "id": "demo-tecnico",
            "email": "tecnico.agro@exemplo.com",
            "name": "Cláudio",
            "role": "Técnico",
            "is_active": True,
            "password_hash": password_hash,
            "region": "Piauí",
            "certificado": True,
            "especialidades": ["Manejo integrado", "Consultoria"]
        }
    ]

    # 2. Posts padrão do feed (de exemplo)
    posts = [
        {
            "id": "post-1",
            "type": "diagnostic",
            "content": "Diagnóstico em soja no Piauí: identificado Phakopsora pachyrhizi (ferrugem asiática) em estágio inicial. Recomendo triazol + estrobilurina. Incidência estimada: 18%.",
            "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
            "tags": ["Soja", "Ferrugem Asiática", "Fungicida"],
            "author_id": "demo-tecnico",
            "author_name": "Dra. Fernanda Luz",
            "author_role": "Agrônoma",
            "author_initials": "FL",
            "author_verified": True,
            "region": "Piauí",
            "comments_count": 31,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
            "pathogen": "Phakopsora pachyrhizi",
            "severity": "Moderada",
            "salary": None,
            "duration": None
        },
        {
            "id": "post-2",
            "type": "simple",
            "content": "Ótimo resultado com gotejamento subsuperficial no milho! −35% no consumo hídrico e +20% na produtividade vs. aspersão convencional.",
            "image_url": "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=80",
            "tags": ["Milho", "Irrigação", "Gotejamento"],
            "author_id": "demo-tecnico",
            "author_name": "Carlos Mendes",
            "author_role": "Técnico Agrícola",
            "author_initials": "CM",
            "author_verified": True,
            "region": "Bahia",
            "comments_count": 24,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
            "pathogen": None,
            "severity": None,
            "salary": None,
            "duration": None
        },
        {
            "id": "post-3",
            "type": "opportunity",
            "content": "Estamos contratando! Estagiário em Agronomia para manejo de culturas de grãos.",
            "image_url": None,
            "tags": ["Estágio", "Agronomia", "Grãos"],
            "author_id": "demo-joao",
            "author_name": "Fazenda Boa Vista",
            "author_role": "Empresa Agrícola",
            "author_initials": "BV",
            "author_verified": False,
            "region": "Mato Grosso",
            "comments_count": 18,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "pathogen": None,
            "severity": None,
            "salary": "R$ 1.200/mês + benefícios",
            "duration": "12 meses"
        },
        {
            "id": "post-4",
            "type": "diagnostic",
            "content": "Mancha foliar em algodão: provável Cercospora gossypina. Condições favoráveis à progressão. Recomendo cúpricos.",
            "image_url": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
            "tags": ["Algodão", "Cercospora", "Manejo"],
            "author_id": "demo-tecnico",
            "author_name": "Dr. Roberto Alves",
            "author_role": "Fitopatologista",
            "author_initials": "RA",
            "author_verified": True,
            "region": "Mato Grosso",
            "comments_count": 45,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat(),
            "pathogen": "Cercospora gossypina",
            "severity": "Alta",
            "salary": None,
            "duration": None
        },
        {
            "id": "post-5",
            "type": "simple",
            "content": "Alguém tem experiência com consórcio milho + Brachiaria ruziziensis? Quero testar ILP em 150 ha no cerrado.",
            "image_url": None,
            "tags": ["ILP", "Milho", "Braquiária", "Cerrado"],
            "author_id": "demo-arthur",
            "author_name": "Ana Paula Costa",
            "author_role": "Produtora Rural",
            "author_initials": "AP",
            "author_verified": False,
            "region": "Goiás",
            "comments_count": 42,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
            "pathogen": None,
            "severity": None,
            "salary": None,
            "duration": None
        },
        {
            "id": "post-6",
            "type": "simple",
            "content": "Iniciando o controle preventivo na lavoura de #Tomate. Alguma sugestão para alternaria?",
            "image_url": None,
            "tags": ["Tomate", "Manejo", "Pragas"],
            "author_id": "demo-tecnico",
            "author_name": "Mariana Silva",
            "author_role": "Produtora",
            "author_initials": "MS",
            "author_verified": True,
            "region": "São Paulo",
            "comments_count": 4,
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
            "pathogen": None,
            "severity": None,
            "salary": None,
            "duration": None
        },
        {
            "id": "post-7",
            "type": "diagnostic",
            "content": "Diagnóstico em #Tomate: detectada Mancha Bacteriana (Xanthomonas spp.). Recomendado controle de umidade e aplicação de cobre.",
            "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&q=80",
            "tags": ["Tomate", "Doença", "Pragas"],
            "author_id": "demo-tecnico",
            "author_name": "Dr. Lucas Ribeiro",
            "author_role": "Consultor",
            "author_initials": "LR",
            "author_verified": True,
            "region": "Minas Gerais",
            "comments_count": 11,
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
            "pathogen": "Xanthomonas spp.",
            "severity": "Moderada",
            "salary": None,
            "duration": None
        },
        {
            "id": "post-8",
            "type": "opportunity",
            "content": "Procura-se auxiliar de colheita para lavoura de #Tomate cereja.",
            "image_url": None,
            "tags": ["Tomate", "Vaga", "Colheita"],
            "author_id": "demo-joao",
            "author_name": "Sítio Recanto",
            "author_role": "Produtor",
            "author_initials": "SR",
            "author_verified": False,
            "region": "Espírito Santo",
            "comments_count": 2,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
            "pathogen": None,
            "severity": None,
            "salary": "R$ 1.800/mês",
            "duration": "3 meses"
        }
    ]

    # 3. Vagas de exemplo (Opportunities)
    opportunities = [
        {
            "id": "vaga-1",
            "title": "Estágio em Monitoramento de Pragas (Soja)",
            "description": "Acompanhamento e monitoramento de pragas e doenças na soja. Levantamento de dados de campo e elaboração de relatórios técnicos de manejo.",
            "region": "Teresina",
            "culture": "Soja",
            "vacancy_type": "Estágio",
            "salary": "R$ 1.400,00 / mês",
            "duration": "6 meses",
            "producer_id": "demo-joao",
            "producer_name": "João Agricultor",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            "id": "vaga-2",
            "title": "Estagiário em Irrigação e Solo (Milho)",
            "description": "Auxílio no manejo de sistemas de gotejamento, coleta de amostras de solo, medição de umidade e apoio no desenvolvimento da lavoura de milho.",
            "region": "Teresina",
            "culture": "Milho",
            "vacancy_type": "Estágio",
            "salary": "R$ 1.200,00",
            "duration": "6 meses",
            "producer_id": "demo-joao",
            "producer_name": "João Agricultor",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=12)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        },
        {
            "id": "vaga-3",
            "title": "Consultoria Freelance em Fitopatologia",
            "description": "Vistoria pontual em plantação de milho na região de Teresina para identificação de ferrugem comum e recomendação de tratamento fitossanitário.",
            "region": "Teresina",
            "culture": "Milho",
            "vacancy_type": "Freelance",
            "salary": "R$ 800,00 / diária",
            "duration": "2 dias",
            "producer_id": "demo-joao",
            "producer_name": "AgroConsultores PI",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=8)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
        },
        {
            "id": "vaga-4",
            "title": "Estágio em Fruticultura (Caju)",
            "description": "Acompanhamento do cultivo de cajueiro anão precoce. Monitoramento de pragas e apoio técnico nas atividades de colheita e pós-colheita.",
            "region": "Floriano",
            "culture": "Caju",
            "vacancy_type": "Estágio",
            "salary": "R$ 1.300,00 / mês",
            "duration": "6 meses",
            "producer_id": "demo-joao",
            "producer_name": "Pomar Sul Piauí",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=20)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()
        },
        {
            "id": "vaga-5",
            "title": "Técnico Agrícola - Hortaliças",
            "description": "Vaga efetiva CLT para gerenciamento de produção de hortaliças em Floriano. Coordenação de equipes de campo e controle de insumos.",
            "region": "Floriano",
            "culture": "Hortaliças",
            "vacancy_type": "Emprego",
            "salary": "R$ 3.200,00 / mês",
            "duration": "Indeterminado (CLT)",
            "producer_id": "demo-joao",
            "producer_name": "Fazenda Vale do Gurgueia",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=25)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=6)).isoformat()
        },
        {
            "id": "vaga-6",
            "title": "Assistente Técnico de Campo (Algodão)",
            "description": "Buscamos profissional técnico para acompanhamento diário de lavoura de algodão orgânico em Parnaíba. Elaboração de relatórios.",
            "region": "Parnaíba",
            "culture": "Algodão",
            "vacancy_type": "Estágio",
            "salary": "R$ 1.500,00 / mês",
            "duration": "12 meses",
            "producer_id": "demo-joao",
            "producer_name": "Algodão Delta do Parnaíba",
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=18)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        }
    ]

    print("Conectando ao banco de dados do Supabase...")
    try:
        conn = psycopg2.connect(
            dbname=config("DB_NAME"),
            user=config("DB_USER"),
            password=config("DB_PASSWORD"),
            host=config("DB_HOST"),
            port=config("DB_PORT")
        )
        cursor = conn.cursor()

        # 1. Garante que as tabelas de posts existem no Supabase (não estavam no script padrão)
        print("Criando tabelas 'posts' e 'post_likes' no Supabase se não existirem...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                image_url TEXT,
                tags TEXT[] DEFAULT '{}',
                author_id TEXT,
                author_name TEXT,
                author_role TEXT,
                author_initials TEXT,
                author_verified BOOLEAN DEFAULT FALSE,
                region TEXT,
                comments_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
                pathogen TEXT,
                severity TEXT,
                salary TEXT,
                duration TEXT
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS post_likes (
                id SERIAL PRIMARY KEY,
                post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
                user_id TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
                UNIQUE(post_id, user_id)
            );
        """)

        # 2. Insere os usuários
        print("Cadastrando usuários de teste (João, Arthur, Cláudio)...")
        for u in users:
            cursor.execute(
                """
                INSERT INTO users (id, email, name, role, is_active, password_hash, region, certificado, especialidades)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    password_hash = EXCLUDED.password_hash,
                    region = EXCLUDED.region,
                    certificado = EXCLUDED.certificado,
                    especialidades = EXCLUDED.especialidades
                """,
                (u["id"], u["email"], u["name"], u["role"], u["is_active"], u["password_hash"], u["region"], u["certificado"], u["especialidades"])
            )

        # 3. Insere os posts de exemplo
        print("Populando posts de exemplo no feed...")
        for p in posts:
            cursor.execute(
                """
                INSERT INTO posts (id, type, content, image_url, tags, author_id, author_name, author_role, author_initials, author_verified, region, comments_count, created_at, pathogen, severity, salary, duration)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (p["id"], p["type"], p["content"], p["image_url"], p["tags"], p["author_id"], p["author_name"], p["author_role"], p["author_initials"], p["author_verified"], p["region"], p["comments_count"], p["created_at"], p["pathogen"], p["severity"], p["salary"], p["duration"])
            )

        # 4. Insere as vagas de exemplo
        print("Populando vagas de exemplo...")
        for o in opportunities:
            cursor.execute(
                """
                INSERT INTO opportunities (id, title, description, region, culture, vacancy_type, salary, duration, producer_id, producer_name, expires_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (o["id"], o["title"], o["description"], o["region"], o["culture"], o["vacancy_type"], o["salary"], o["duration"], o["producer_id"], o["producer_name"], o["expires_at"], o["created_at"])
            )

        conn.commit()
        print("\nProntinho! Bancos criados e dados de exemplo (Feed, Vagas, Usuários) populados no seu Supabase!")
    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        print(f"Erro ao inserir dados: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    seed()
