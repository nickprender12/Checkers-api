const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("build"));

let users = [];
let messages = [];
let board = [];
let moves = [];
let newPlayers = null;

io.on("connection", (socket) => {
  const { id } = socket;
  console.log("a user connected ", id);

  socket.on("disconnect", () => {
    console.log(`user ${id} has disconnected`);
    let newUserList = users.filter((user) => user.id !== id);
    users = newUserList;
    io.emit("user disconnected", users);
    // io.to(users[0].id).emit('user disconnected', )
    if (users.length < 2) {
      messages = [];
    }
  });

  socket.on("chat message", ({ currentUser, msg }) => {
    let messageObj = {
      date: new Date().toISOString(),
      user: currentUser,
      message: msg,
      id: id,
    };
    messages.push(messageObj);
    io.emit("chat message", messages);
  });

  socket.on("new user", (username) => {
    let color = "yellow";
    if (users.length >= 1) {
      color = "blue";
    }
    let user = {
      id: id,
      name: username,
      color: color,
    };
    users.push(user);
    io.emit("new user", users);
    io.to(id).emit("current user", user);
    io.to(id).emit("chat message", messages);
  });

  socket.on("initiate Board", ({ board, players, moves }) => {
    let opponent = users.filter((user) => user.id !== id);
    io.to(opponent[0].id).emit("new board", board, players, moves);
  });

  socket.on(
    "updated board",
    (updatedBoard, updatedMoves, activePlayer, players) => {
      board = updatedBoard;
      moves = updatedMoves;
      let boardAndMovesObj = {
        board: updatedBoard,
        moves: updatedMoves,
        player: activePlayer,
        players: players,
      };
      let opponentsId = users.filter((user) => user.id !== id);
      io.to(opponentsId[0].id).emit("updated board", boardAndMovesObj);
    }
  );
  socket.on("initiate Board", ({ board, players, moves }) => {
    let opponent = users.filter((user) => user.id !== id);
    io.to(opponent[0].id).emit("new board", board, players, moves);
  });

  socket.on(
    "updated board",
    (updatedBoard, updatedMoves, activePlayer, players) => {
      board = updatedBoard;
      moves = updatedMoves;
      let boardAndMovesObj = {
        board: updatedBoard,
        moves: updatedMoves,
        player: activePlayer,
        players: players,
      };
      let opponentsId = users.filter((user) => user.id !== id);
      io.to(opponentsId[0].id).emit("updated board", boardAndMovesObj);
    }
  );

  socket.on("user is typing", () => {
    let opponentsId = users.filter((user) => user.id !== id);
    io.to(opponentsId[0].id).emit("user is typing");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
