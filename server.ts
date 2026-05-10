import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Routes
import authRoutes from "./server/routes/authRoutes";
import projectRoutes from "./server/routes/projectRoutes";
import taskRoutes from "./server/routes/taskRoutes";
import { checkDbConnection } from "./server/middleware/dbCheck";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  // Sanity check for common URI mistakes (like unencoded @ in password)
  const isPossiblyMalformed = MONGODB_URI.includes('@@');
  
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Successfully connected to MongoDB"))
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
      if (isPossiblyMalformed || err.message.includes('Protocol and host list are required')) {
        console.error("\n💡 FIX DETECTED: Your MONGODB_URI seems to have an unencoded '@' in the password.");
        console.error("👉 If your password contains '@', please replace it with '%40'.");
        console.error("Example: 'p@ssword' becomes 'p%40ssword'\n");
      }
    });
} else {
  console.warn("⚠️ MONGODB_URI is not defined. Database features will not work.");
  console.warn("👉 Action Required: Add MONGODB_URI to your Secrets panel from a service like MongoDB Atlas.");
}

  app.use(cors());
  app.use(express.json());

  // Socket.io injection
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("join-project", (projectId) => {
      socket.join(projectId);
      console.log(`User ${socket.id} joined project: ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

// Removed strict DB check for demo purposes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
