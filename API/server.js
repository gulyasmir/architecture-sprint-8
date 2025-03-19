require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;

// 🔹 Подключаем JWKS-клиент (получает публичные ключи от Keycloak)
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`
});

// 📌 Получение ключа для валидации JWT
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// 📌 Middleware для проверки токена
function checkJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

// 📌 Middleware для проверки роли
function checkRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.realm_access || !req.user.realm_access.roles.includes(role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// 📌 Генерация случайных отчетов
function generateReport() {
  return {
    id: Math.floor(Math.random() * 10000),
    date: new Date().toISOString(),
    summary: "This is a randomly generated report.",
    data: {
      users: Math.floor(Math.random() * 1000),
      revenue: (Math.random() * 10000).toFixed(2),
      errors: Math.floor(Math.random() * 50)
    }
  };
}

// 📌 API `/reports` (Только для `prothetic_user`)
app.get("/reports", checkJwt, checkRole("prothetic_user"), (req, res) => {
  const report = generateReport();
  res.json(report);
});

// 📌 Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
