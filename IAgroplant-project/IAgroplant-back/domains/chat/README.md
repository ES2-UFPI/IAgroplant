# Chat

Servidor Node.js com Socket.IO responsável pela comunicação em tempo real entre usuários.

## Como executar

```bash
npm install
npm start
```

Por padrão, o serviço sobe em `http://localhost:3001`.

## Eventos

- `conectado`: retorna o id do socket conectado.
- `historico`: retorna as últimas mensagens da sala atual.
- `trocarSala`: troca a sala ativa do socket.
- `mensagem`: envia uma mensagem para a sala da tag informada.
- `usuariosOnline`: lista usuários online por sala.
- `digitando` / `pararDigitando`: indica atividade de digitação.
