# Persistência - Histórico de Diagnósticos IA

## Visão geral

A persistência dos diagnósticos é responsável por armazenar o histórico das análises realizadas pela IA.

Após o usuário enviar uma imagem de uma planta, o sistema:

1. Recebe a imagem pelo aplicativo React Native.
2. Processa a imagem e envia para o serviço de diagnóstico IA.
3. Formata a resposta da IA.
4. Cria um registro de diagnóstico.
5. Persiste o resultado no banco de dados.
6. Disponibiliza consultas posteriores através do histórico de diagnósticos.

A persistência foi implementada utilizando o padrão **Repository Pattern**, mantendo o domínio desacoplado da tecnologia de banco de dados.

---

# Arquitetura da persistência

Fluxo geral:

```
React Native
      |
      |
      v
DiagnosticController
      |
      |
      v
SaveDiagnosticRecordUseCase
      |
      |
      v
IDiagnosticRecordRepository
      |
      |
      v
PostgresDiagnosticRecordRepository
      |
      |
      v
PostgreSQL
```

A camada de aplicação conhece apenas a interface:

```
IDiagnosticRecordRepository
```

Ela não sabe se os dados estão sendo armazenados em PostgreSQL, Supabase ou outro banco.

---

# Entidade de domínio

O diagnóstico é representado pela entidade:

```
DiagnosticRecord
```

Responsável por representar um diagnóstico realizado pela IA.

Exemplo:

```python
@dataclass
class DiagnosticRecord:

    id: Optional[int]

    user_id: str

    image_path: str

    description: str

    pathogen: str

    severity: str

    management: str

    created_at: Optional[datetime]
```

A entidade contém apenas dados do domínio.

Ela não possui:

- consultas SQL;
- dependência do Django ORM;
- regras de banco.

---

# Modelo de persistência

A camada de infraestrutura possui o modelo responsável pelo banco.

Exemplo:

```
DiagnosticRecordModel
```

Responsável por mapear:

```
Objeto de domínio
        |
        |
        v
Tabela PostgreSQL
```

Tabela:

```
diagnostic_records
```

Estrutura:

| Campo | Tipo |
|-|-|
| id | UUID / Integer |
| user_id | String |
| image_path | String |
| description | Text |
| pathogen | String |
| severity | String |
| management | Text |
| created_at | Timestamp |

---

# Repository Pattern

Interface:

```
IDiagnosticRecordRepository
```

Define os comportamentos esperados:

```python
class IDiagnosticRecordRepository:

    def save(self, record):
        pass

    def find_by_user(self, user_id):
        pass

    def find_by_id(self, id):
        pass

    def delete(self, id):
        pass
```

A aplicação depende dessa abstração.

---

# 1. Salvar diagnóstico

## Fluxo

Quando o usuário realiza uma análise:

```
Usuário
 |
 |
Enviar imagem
 |
 |
DiagnosticController
 |
 |
IA Analysis
 |
 |
SaveDiagnosticRecordUseCase
 |
 |
Repository.save()
 |
 |
Banco
```

---

## Caso de uso

Responsabilidade:

- receber o diagnóstico pronto;
- validar regras;
- enviar para persistência.

Exemplo:

```python
class SaveDiagnosticRecordUseCase:

    def __init__(
        self,
        repository
    ):
        self.repository = repository


    def execute(self, record):

        return self.repository.save(record)
```

---

## Repository

Implementação PostgreSQL:

```python
class PostgresDiagnosticRecordRepository:

    def save(self, record):

        DiagnosticRecordModel.objects.create(

            id=record.id,

            user_id=record.user_id,

            image_path=record.image_path,

            description=record.description,

            pathogen=record.pathogen,

            severity=record.severity,

            management=record.management
        )
```

Resultado:

```
Novo diagnóstico criado no banco.
```

---

# 2. Listar diagnósticos

## Objetivo

Permitir que o usuário visualize seu histórico.

Fluxo:

```
React Native

GET /api/diagnostics/history

        |

DiagnosticHistoryController

        |

GetMyDiagnosticHistoryUseCase

        |

Repository.find_by_user()

        |

PostgreSQL
```

---

## Caso de uso

```python
class GetMyDiagnosticHistoryUseCase:


    def execute(self, user_id):

        return (
            self.repository
            .find_by_user(user_id)
        )
```

---

## Repository

Consulta:

```python
def find_by_user(self, user_id):

    return (
        DiagnosticRecordModel.objects
        .filter(
            user_id=user_id
        )
        .order_by(
            "-created_at"
        )
    )
```

Resultado:

Retorna somente diagnósticos pertencentes ao usuário autenticado.

---

# 3. Buscar detalhes de um diagnóstico

## Objetivo

Abrir uma análise específica.

Fluxo:

```
Usuário seleciona diagnóstico

        |

GET /api/diagnostics/{id}

        |

GetDiagnosticDetailsUseCase

        |

Repository.find_by_id()

        |

Banco
```

---

Repository:

```python
def find_by_id(self, id):

    return (
        DiagnosticRecordModel.objects
        .get(
            id=id
        )
    )
```

Retorna:

```json
{
 "pathogen": "Ferrugem",
 "severity": "Alta",
 "management": "Aplicar fungicida..."
}
```

---

# 4. Excluir diagnóstico

## Objetivo

Permitir que o usuário remova um diagnóstico do histórico.

Fluxo:

```
Usuário

 |

DELETE /api/diagnostics/{id}

 |

DeleteDiagnosticUseCase

 |

Repository.delete()

 |

Banco
```

---

Caso de uso:

```python
class DeleteDiagnosticUseCase:


    def execute(self, id):

        return (
            self.repository
            .delete(id)
        )
```

---

Repository:

```python
def delete(self, id):

    DiagnosticRecordModel.objects.filter(
        id=id
    ).delete()
```

Resultado:

```
Registro removido permanentemente.
```

---

# Segurança

Todas as operações utilizam o usuário autenticado através do JWT.

O histórico é filtrado pelo:

```
user_id
```

Isso impede que um usuário consulte ou exclua diagnósticos pertencentes a outro usuário.

---

# Docker e inicialização do banco

A criação das tabelas é automatizada pelo entrypoint do backend.

Fluxo:

```
docker compose up

        |

Container iniciado

        |

docker-entrypoint.sh

        |

Executa migrations

        |

python manage.py migrate

        |

Servidor Django inicia

```

Assim, novos desenvolvedores conseguem executar o projeto com:

```bash
docker compose up --build
```

sem executar manualmente:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

# Possível migração para Supabase

Como a aplicação utiliza:

```
Domain
   |
Use Case
   |
Repository Interface
   |
Infrastructure
```

a troca de PostgreSQL para Supabase altera somente:

```
PostgresDiagnosticRecordRepository
```

por:

```
SupabaseDiagnosticRecordRepository
```

A camada de domínio e o aplicativo React Native permanecem inalterados.