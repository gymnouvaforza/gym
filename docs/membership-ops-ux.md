# Operaciones de Membresía - Guía de UX y Cobros

Este documento describe la organización de la pantalla de detalle de membresía y el funcionamiento del sistema de cobros manuales.

## Organización de la Pantalla

La interfaz ha sido reorganizada para priorizar la labor operativa de recepción y administración:

1.  **Siguiente Acción (Foco Operativo):** Un bloque destacado en la parte superior que indica qué paso falta para completar la gestión (ej. "Enviar QR al socio" o "Registrar abono").
2.  **Resumen para Recepción:** Información clave agrupada: Socio, Plan, Vigencia y estados de cuenta (Total, Pagado, Pendiente).
3.  **Registro de Cobro (Columna Derecha):** Acceso inmediato para registrar abonos, pagos completos o ajustes manuales.
4.  **Comunicación y Acceso:** Sección unificada para gestionar el envío de correos y la validación por código QR.
5.  **Historial Operativo:** Bitácora de pagos registrados y anotaciones internas del equipo.
6.  **Detalles Técnicos:** Información sobre la sincronización con Medusa (Bridge Commerce) y IDs técnicos, relegada a un plano secundario al final de la página.

## Cobros Manuales Permisivos

El sistema de pagos ahora es más flexible para adaptarse a la realidad operativa del club:

-   **Abonos Parciales:** Se pueden registrar abonos de cualquier importe mayor a 0 en cualquier momento.
-   **Sobrepagos y Ajustes:** El sistema permite registrar cobros incluso si el saldo pendiente es 0 o si el importe supera la deuda actual. Estos se registran como **ajustes manuales** o **sobrepagos**, resultando en un saldo a favor del socio si la lógica de negocio así lo determina.
-   **Independencia Commerce:** No es necesario que la sincronización con Medusa esté completada (`ok`) para registrar abonos manuales en el ledger interno.

## Pruebas Manuales Recomendadas (Checklist)

Para validar que los cambios funcionan correctamente en producción:

- [ ] **Abono normal:** Registrar un pago menor al saldo. Verificar que el saldo pendiente disminuye y se guarda en el historial.
- [ ] **Pago completo:** Usar el botón "Cubrir saldo pendiente". El estado de pago debe pasar a "Pagada".
- [ ] **Sobrepago:** Registrar un importe mayor al saldo pendiente. Verificar que el sistema muestra el aviso de sobrepago y permite guardarlo.
- [ ] **Ajuste manual:** Registrar un pago cuando el saldo ya es 0. Verificar que se permite el registro bajo el concepto de "Ajuste".
- [ ] **Acceso rápido QR:** Abrir la pantalla de validación desde el nuevo bloque de Comunicación.
- [ ] **Envío de Email:** Re-enviar el correo de acceso y confirmar que el estado se actualiza visualmente.
- [ ] **Responsive:** Verificar que en móvil la columna de cobro aparece debajo del resumen principal pero sigue siendo fácilmente accesible.
