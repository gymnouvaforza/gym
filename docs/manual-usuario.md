# Manual de Usuario - Nova Forza Gym

Este documento proporciona las instrucciones necesarias para gestionar el sitio web y el panel de administración de **Nova Forza Gym**.

## 1. Acceso al Panel de Administración

El panel de administración (Backoffice) es la herramienta principal para gestionar los leads, la tienda y la configuración del sitio.

- **URL de Acceso:** `https://nuovaforzagym.com/login` (o `/login` en el dominio local).
- **Credenciales:** Consulte con su administrador de sistemas para obtener su usuario y contraseña personal de Supabase.

## 2. Gestión de Leads (Contactos)

Cada vez que un usuario completa el formulario de contacto en la web pública, se genera un "Lead" en el sistema.

### Pasos para gestionar leads:
1. Acceda al **Dashboard**.
2. Diríjase a la sección **Leads** (o Mensajes).
3. Revise la lista de prospectos:
   - **Nombre:** Identificación del cliente potencial.
   - **Email/Teléfono:** Datos de contacto.
   - **Mensaje:** Consulta específica enviada desde la web.
4. Puede marcar los leads como "Atendidos" para mantener un control del seguimiento comercial.

## 3. Gestión de la Tienda (Pickup)

El sistema utiliza **Medusa v2** como motor de eCommerce, pero la gestión se realiza íntegramente desde nuestro Dashboard personalizado en la sección **Tienda**.

### Flujo de Pedidos Pickup:
1. El cliente compra en la web y selecciona "Recogida en tienda" (Pickup).
2. El pedido aparecerá en el Dashboard -> **Pedidos**.
3. Una vez que el producto esté listo para ser entregado, cambie el estado a "Listo para recogida".
4. Cuando el cliente recoja el producto, marque el pedido como "Entregado".

### Actualización del Catálogo:
- Para añadir o editar productos y categorías, utilice la sección **Tienda** del Dashboard.
- **Nota Importante:** Los cambios se sincronizan automáticamente con el motor de Medusa y los enlaces de soporte en Supabase. Si nota alguna inconsistencia, puede solicitar una sincronización manual al soporte técnico.

## 4. Configuración del Sitio (CMS)

Algunos textos y configuraciones legales se pueden ajustar desde la sección **Ajustes** o **CMS** del panel.

- **Textos Legales:** Puede actualizar la Política de Privacidad, Términos y Condiciones, y Cookies.
- **Información de Contacto:** Email de soporte, dirección física en Chiclayo y horarios de atención.

## 5. Soporte Técnico

Si experimenta problemas técnicos o necesita una funcionalidad adicional, por favor contacte a:

- **Email:** soporte@nuovaforzagym.com
- **Web:** [Nova Forza Gym Support](https://nuovaforzagym.com)

---
*Ultima actualización: Abril 2026*
