# Настройка Keycloak

Для доступа к ****Keycloak Admin Console** выполните следующие шаги:

1. **Откройте веб-браузер** и перейдите по адресу: `http://localhost:8080/`.

   ![1742300962932](images/НастройкаKeycloak/1742300962932.png)
2. **Создайте учётную запись администратора**:

   * **При первом запуске Keycloak вам будет предложено создать администратора.**
   * **Введите желаемые ****имя пользователя** и **пароль****.**
   * **Нажмите кнопку ****"Create"****.**
   * ![1742301001696](images/НастройкаKeycloak/1742301001696.png)
3. **Войдите в консоль управления**:

   * **После создания учётной записи вы будете перенаправлены на страницу входа.**
   * **Введите созданные ранее ****имя пользователя** и **пароль****.**
   * **Нажмите кнопку ****"Войти"****.**
   * ![1742301072043](images/НастройкаKeycloak/1742301072043.png)

**После успешного входа вы получите доступ к ****Keycloak Admin Console****, где сможете управлять пользователями, ролями и настройками безопасности.**

![1742301107658](images/НастройкаKeycloak/1742301107658.png)****

**Примечание**: **Если вы используете Docker для запуска Keycloak, убедитесь, что контейнеры Keycloak и базы данных PostgreSQL работают корректно.**Для этого выполните команду `docker ps` и убедитесь, что оба контейнера запущены.

![1742301130195](images/НастройкаKeycloak/1742301130195.png)

### **Включите Direct Access Grants для клиента:**

* **Войдите в ****Keycloak Admin Console****. - описано выше
* **Перейдите в раздел ****Clients** и выберите ваш клиент (`reports-frontend`).
* ![1742301347281](images/НастройкаKeycloak/1742301347281.png)
* **В разделе ****Settings** установите флажок **Direct Access Grants Enabled****.**(https://habr.com/ru/companies/axenix/articles/780422/)
  ![1742301417738](images/НастройкаKeycloak/1742301417738.png)
* **Нажмите ****Save** для сохранения изменений.[Habr](https://habr.com/ru/companies/axenix/articles/780422/)
* ![1742302041014](images/НастройкаKeycloak/1742302041014.png)

Это позволит вашему клиенту использовать грант типа "password" для получения токена.

### **Проверьте тип доступа клиента:**

* **Убедитесь, что параметр ****Access Type** установлен в значение **public** или **confidential** в зависимости от конфигурации вашего клиента.[Habr**+1**Stack Overflow**+1**](https://habr.com/ru/companies/axenix/articles/780422/)
* **Если клиент имеет тип доступа ****confidential****, необходимо использовать **`client_secret` при запросе токена.[Habr](https://habr.com/ru/companies/axenix/articles/780422/)

Если клиент настроен как **confidential**, запрос должен включать `client_secret`:

```
curl -X POST "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=reports-frontend" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "grant_type=password" \
     -d "username=user1" \
     -d "password=password123"

```

Если клиент настроен как **public**, `client_secret` не требуется:

```
curl -X POST "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=reports-frontend" \
     -d "grant_type=password" \
     -d "username=user1" \
     -d "password=password123"

```

![1742302247247](images/НастройкаKeycloak/1742302247247.png)

### Проверьте кэширование конфигурации:

Иногда изменения в настройках клиента могут не применяться из-за кэширования. Рекомендуется очистить кэш Keycloak или перезапустить сервер, чтобы убедиться, что новые настройки вступили в силу.

### Убедитесь в правильности учетных данных

Убедитесь, что вы используете правильные `username` и `password` для существующего пользователя в вашем Keycloak Realm.

**Примечание:**

Использование гранта типа "password" (Resource Owner Password Credentials Grant) не рекомендуется для публичных клиентов из соображений безопасности.**Рекомендуется использовать ****Authorization Code Flow** с PKCE для повышения безопасности.

Следуя этим шагам, вы сможете настроить ваш клиент в Keycloak для использования Direct Access Grants и успешно получать токены с помощью гранта типа "password".
