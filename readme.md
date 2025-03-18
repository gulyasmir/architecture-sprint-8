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
