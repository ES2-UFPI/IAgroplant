const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.CHAT_PORT || process.env.PORT || 3001;
const HISTORY_LIMIT = 100;

const TAGS = [
  "Geral",
  "Dúvidas Agrícolas",
  "Pragas e Doenças",
  "Solo e Adubação",
  "Irrigação",
  "Plantio e Cultivo",
  "Máquinas Agrícolas",
  "Empregos e Oportunidades",
  "Estudos e Cursos",
  "Bate-papo",
];

const messages = [];

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", service: "iagroplant-chat" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("IAgroplant chat server");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

function isValidRoom(room) {
  return room === "Todas" || TAGS.includes(room);
}

function roomHistory(room) {
  const filtered = room === "Todas"
    ? messages
    : messages.filter((message) => message.tag === room);

  return filtered.slice(-HISTORY_LIMIT);
}

function onlineUsers(room) {
  return [...io.sockets.sockets.values()]
    .filter((socket) => room === "Todas" || socket.currentRoom === room || socket.currentRoom === "Todas")
    .map((socket) => ({
      id: socket.id,
      nome: socket.user?.name || "Usuário",
      role: socket.user?.role || "Comunidade",
    }));
}

function broadcastOnlineUsers() {
  io.emit("usuariosOnline", {
    sala: "Todas",
    usuarios: onlineUsers("Todas"),
  });

  TAGS.forEach((tag) => {
    io.to(tag).emit("usuariosOnline", {
      sala: tag,
      usuarios: onlineUsers(tag),
    });
  });
}

function joinRoom(socket, room) {
  TAGS.forEach((tag) => socket.leave(tag));

  if (room === "Todas") {
    TAGS.forEach((tag) => socket.join(tag));
  } else {
    socket.join(room);
  }

  socket.currentRoom = room;
}

io.on("connection", (socket) => {
  socket.user = {
    id: socket.handshake.auth?.userId || socket.id,
    name: socket.handshake.auth?.name || "Usuário",
    role: socket.handshake.auth?.role || "Comunidade",
  };
  socket.currentRoom = "Todas";

  joinRoom(socket, "Todas");

  socket.emit("conectado", { id: socket.id });
  socket.emit("historico", roomHistory("Todas"));
  broadcastOnlineUsers();

  socket.on("trocarSala", (receivedRoom) => {
    const room = isValidRoom(receivedRoom) ? receivedRoom : "Todas";
    joinRoom(socket, room);
    socket.emit("historico", roomHistory(room));
    socket.emit("sistema", {
      texto: room === "Todas" ? "Você está vendo todas as salas" : `Você entrou na sala: ${room}`,
    });
    broadcastOnlineUsers();
  });

  socket.on("mensagem", (data = {}) => {
    const text = String(data.texto || "").trim().slice(0, 500);
    const tag = TAGS.includes(data.tag) ? data.tag : "Geral";
    if (!text) return;

    const now = new Date();
    const message = {
      id: `${Date.now()}-${socket.id}`,
      texto: text,
      tag,
      horario: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      criado_em: now.toISOString(),
      autor_id: socket.id,
      autor_nome: data.autor_nome || socket.user.name,
      autor_perfil: socket.user.role,
    };

    messages.push(message);
    if (messages.length > HISTORY_LIMIT * TAGS.length) messages.shift();

    io.to(tag).emit("mensagem", message);
  });

  socket.on("digitando", (data = {}) => {
    const tag = TAGS.includes(data.tag) ? data.tag : socket.currentRoom;
    socket.broadcast.emit("digitando", {
      id: socket.id,
      sala: tag,
    });
  });

  socket.on("pararDigitando", (data = {}) => {
    const tag = TAGS.includes(data.tag) ? data.tag : socket.currentRoom;
    socket.broadcast.emit("pararDigitando", {
      id: socket.id,
      sala: tag,
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("pararDigitando", {
      id: socket.id,
      sala: socket.currentRoom,
    });
    broadcastOnlineUsers();
  });
});

server.listen(PORT, () => {
  console.log(`IAgroplant chat server running on http://localhost:${PORT}`);
});
