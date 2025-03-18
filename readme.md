# Реализация  PKCE

### Keycloak

Чтобы настроить **PKCE** в `realm-export.json`, нужно внести изменения в настройки клиента `reports-frontend` и убедиться, что `reports-api` поддерживает корректную аутентификацию.

#### **Шаг 1. Настроить `reports-frontend` для PKCE**

Изменяем настройки клиентского приложения `reports-frontend`:

* **Удаляем**`directAccessGrantsEnabled`, так как PKCE использует Authorization Code Flow.
* **Добавляем**`standardFlowEnabled: true`, чтобы разрешить авторизацию через PKCE.
* **Добавляем**`attributes` → `pkce.code.challenge.method: S256`, чтобы явно включить PKCE.

#### **Шаг 2. Проверить настройки `reports-api`**

* Так как `reports-api` используется в режиме **bearer-only**, изменений не требуется.
* Он будет проверять `access_token`, который `reports-frontend` получает через PKCE.

#### **Шаг 3. После внесения изменений можно загрузить их в Keycloak**

это можно сделать так:

```
kcadm.sh create realms -f realm-export.json
```

или так:

```
docker exec -it keycloak-container keycloak import --file realm-export.json
```

Теперь  PKCE настроен и фронтенд будет использовать его при  авторизации.

## Запуск фронтенд + keycloak + api

Т.к. в проекте все изменения уже внесены достаточно запустить :

```
docker compose up -d
```

После запуска можно настроить keycloak, как это сделать подробно описано тут - Настройка Keycloak.md

## Получение токенов

Для тестирования API бекенда нам понадобятся токены. Чтобы получить **VALID\_USER\_TOKEN** и **VALID\_PROTHETIC\_USER\_TOKEN**, можно использовать Keycloak и выполнить запрос на получение токена.

### Получение токена через команду `curl`

Формат запроса на получение токена:

```
curl -X POST "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=reports-frontend" \
     -d "grant_type=password" \
     -d "username=USERNAME" \
     -d "password=PASSWORD"

```

Пример: получение токена для обычного пользователя (`user1`). Этот запрос отдаст нам VALID_USER_TOKEN, но без роли prothetic_user :

```
curl -X POST "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=reports-frontend" \
     -d "grant_type=password" \
     -d "username=user1" \
     -d "password=password123"

```

![1742302531578](images/readme/1742302531578.png)

Пример: получение токена для `prothetic_user` (`prothetic1`) - отдаст токен – VALID\_PROTHETIC\_USER\_TOKEN

```
curl -X POST "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=reports-frontend" \
     -d "grant_type=password" \
     -d "username=prothetic1" \
     -d "password=prothetic123"

```

![1742302496455](images/readme/1742302496455.png)

## Использование полученного токена

После выполнения `curl`-запроса Keycloak вернёт JSON:

```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ij...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX...",
  "refresh_expires_in": 1800,
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "3f8a7e1a-4f1b-4e9b-9385-...",
  "scope": "profile email"
}

```

В ответе  `access_token`, который далее использовать в запросах.

## Тестирование API с токенами

### Примеры запросов с токенами

Запрос с `INVALID_TOKEN` (недействительный токен)

```
curl -X GET http://localhost:4000/reports -H "Authorization: Bearer INVALID_TOKEN"
```

Должен прийти ответ:

```{
"error": "Invalid token"
}
```

Запрос с `VALID_USER_TOKEN` (нет роли `prothetic_user`)

```
curl -X GET http://localhost:4000/reports -H "Authorization: Bearer VALID_USER_TOKEN"

```

Ответ:

```
{
  "error": "Access denied"
}
```

Запрос с `VALID_PROTHETIC_USER_TOKEN` (доступ разрешён)

```
curl -X GET http://localhost:4000/reports -H "Authorization: Bearer VALID_PROTHETIC_USER_TOKEN"
```

Ответ:

```
{
  "id": 8673,
  "date": "2024-03-17T15:24:36.123Z",
  "summary": "This is a randomly generated report.",
  "data": {
    "users": 345,
    "revenue": "5021.99",
    "errors": 8
  }
}
```
