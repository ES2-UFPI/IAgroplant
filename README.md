# Arquitetura do Projeto

## Visão Geral

Este projeto segue os princípios de:

* MVC (Model-View-Controller)
* Clean Architecture

A arquitetura foi projetada para ser independente de tecnologias específicas, permitindo substituir frameworks, bancos de dados ou provedores externos sem impactar as regras de negócio. 
A escolha da utilização docker tem a finalidade de minimizar conflitos de configuração de ambiente no desenvolvimento.

---

# Estrutura Geral

```text
project-root/
├── docs/
├── docker/
├── scripts/
├── shared/
├── domains/
├── backend/
├── mobile/
├── integrations/
├── tests/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# docs/

Documentação técnica do projeto.

Responsabilidades:

* Diagramas arquiteturais
* Fluxos de negócio
* Contratos de API
* ADRs (Architecture Decision Records)

```text
docs/
├── architecture/
├── diagrams/
├── api/
└── decisions/
```

---

# docker/

Arquivos relacionados à infraestrutura Docker.

Responsabilidades:

* Ambientes locais
* Homologação
* Produção

```text
docker/
├── local/
├── staging/
└── production/
```

---

# scripts/

Scripts auxiliares utilizados durante desenvolvimento, deploy e manutenção.

Exemplos:

* Seed de banco
* Backup
* Migrações
* Automatizações

---

# shared/

Componentes compartilhados entre múltiplos domínios.

Responsabilidades:

```text
shared/
├── contracts/
├── events/
├── constants/
├── errors/
└── utils/
```

### contracts/

Interfaces compartilhadas.

### events/

Eventos de domínio compartilhados.

### constants/

Constantes globais.

### errors/

Exceções e erros padronizados.

### utils/

Funções utilitárias genéricas.

---

# domains/

Núcleo da aplicação.

Contém todas as regras de negócio.

Nenhum domínio deve depender diretamente de:

* Banco de dados
* Frameworks
* APIs externas
* Firebase
* OpenAI
* Supabase

Estrutura padrão:

```text
domains/
└── nome-do-dominio/
    ├── domain/
    ├── application/
    ├── presentation/
    └── infrastructure/
```

---

## domain/

Camada mais importante do sistema.

Contém:

```text
domain/
├── entities/
├── value-objects/
├── repositories/
├── services/
└── events/
```

### entities/

Entidades de negócio.

Exemplos:

* User
* Post
* Comment
* Message

### value-objects/

Objetos sem identidade própria.

Exemplos:

* Email
* CPF
* Address

### repositories/

Contratos de persistência.

Exemplo:

```text
UserRepository
```

A implementação real fica na infraestrutura.

### services/

Regras de negócio complexas.

### events/

Eventos internos do domínio.

---

## application/

Orquestra os casos de uso.

```text
application/
├── use-cases/
├── dto/
├── commands/
└── queries/
```

### use-cases/

Fluxos de negócio.

Exemplos:

* CreateUser
* PublishPost
* SendMessage

### dto/

Objetos de transferência de dados.

### commands/

Operações de escrita.

### queries/

Operações de leitura.

---

## presentation/

Implementação do padrão MVC.

```text
presentation/
├── controllers/
├── view-models/
└── validators/
```

### controllers/

Recebem requisições.

Responsabilidades:

* Validar entrada
* Chamar casos de uso
* Retornar resposta

### view-models/

Transformam dados para apresentação.

### validators/

Validação de entrada.

---

## infrastructure/

Implementações técnicas.

```text
infrastructure/
├── persistence/
├── external-services/
└── mappers/
```

### persistence/

Implementação dos repositórios.

Exemplos:

```text
PostgresUserRepository
SupabasePostRepository
```

### external-services/

Integrações externas.

Exemplos:

* Firebase
* OpenAI
* Gemini

### mappers/

Conversões entre modelos.

---

# backend/

Camada responsável pela exposição dos serviços.

```text
backend/
├── api/
├── composition-root/
└── config/
```

---

## api/

Ponto de entrada da aplicação.

```text
api/
├── rest/
├── websocket/
├── middlewares/
└── routes/
```

### rest/

Endpoints HTTP.

### websocket/

Comunicação em tempo real.

### middlewares/

Interceptadores de requisição.

### routes/

Mapeamento das rotas.

---

## composition-root/

Responsável pela injeção de dependências.

É onde as interfaces são conectadas às implementações concretas.

Exemplo:

```text
UserRepository
        ↓
PostgresUserRepository
```

---

## config/

Configurações da aplicação.

Exemplos:

* Ambiente
* Segurança
* Logs

---

# mobile/

Aplicação cliente.

Estrutura semelhante à do backend.

```text
mobile/
├── presentation/
├── application/
├── domain/
├── infrastructure/
└── tests/
```

Objetivo:

Manter a mesma separação arquitetural em todas as plataformas.

---

# integrations/

Provedores externos.

```text
integrations/
├── authentication/
├── push-notifications/
├── ai-providers/
├── storage/
└── analytics/
```

Exemplos:

* Firebase
* Auth0
* OpenAI
* Gemini
* Cloudinary

Esses serviços nunca devem ser acessados diretamente pelos domínios.

---

# tests/

Testes automatizados.

```text
tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

### unit/

Testam regras de negócio isoladas.

### integration/

Testam integração entre componentes.

### contract/

Garantem compatibilidade entre serviços.

### e2e/

Testam fluxos completos da aplicação.

---

# Fluxo Arquitetural

```text
Request
   ↓
Controller
   ↓
Use Case
   ↓
Domain
   ↓
Repository Interface
   ↓
Infrastructure
   ↓
Database / API Externa
```

As dependências sempre apontam para dentro.

O domínio nunca conhece tecnologias específicas.
