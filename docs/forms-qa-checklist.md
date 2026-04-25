# Checklist de QA - Formularios

Este documento detalla el estado y las pruebas necesarias para los formularios principales del sistema.

## Formularios Revisados

| Formulario | Ruta/Archivo | Validación (Zod) | Estado de Carga | Errores Servidor |
| :--- | :--- | :--- | :--- | :--- |
| Login | `src/features/auth/components/LoginForm.tsx` | Sí (min 6 chars) | Sí (AuthBlockingState) | Toast + Inline |
| Contacto (Leads) | `src/components/marketing/LeadForm.tsx` | Sí | Sí (Loader2) | Mensaje amigable |
| Member Profile | `src/components/admin/MemberProfileForm.tsx` | Sí (Schema extendido) | Sí (Sincronizando...) | Toast |
| Routine Template | `src/components/admin/RoutineTemplateForm.tsx` | Sí | Sí (isPending) | Toast |
| Marketing Schedule | `src/components/admin/MarketingScheduleForm.tsx` | Sí | Sí (isPending) | Feedback inline |
| Marketing Plans | `src/components/admin/MarketingPlansForm.tsx` | Sí | Sí (isPending) | Feedback inline |
| Store Product | `src/components/admin/StoreProductForm.tsx` | Sí | Sí (Procesando...) | Toast |
| Store Category | `src/components/admin/StoreCategoryForm.tsx` | Sí | Sí (isPending) | Toast |

## Mejoras Realizadas

1.  **Auth Schema:** Se unificó la validación de contraseña a un mínimo de 6 caracteres en el Login para ser consistente con el esquema de actualización de contraseña.
2.  **Member Profile:** Se añadió un icono de carga (`RotateCcw` con animación) al botón de "Guardar Borrador" para dar feedback inmediato al usuario durante el guardado local.
3.  **Labels:** Se revisaron y confirmaron los labels de los botones de acción para que sean explícitos ("Actualizar Registro", "Crear Ficha Oficial", etc.).

## Checklist de Pruebas Manuales

Para cada formulario, realizar las siguientes pruebas:

- [x] **Envío válido:** Rellenar todos los campos correctamente y enviar. Debe mostrar feedback de éxito o redirigir.
- [x] **Envío inválido:** Dejar campos obligatorios vacíos o con formato incorrecto. Debe mostrar mensajes de error claros en castellano.
- [ ] **Campos obligatorios:** Verificar que los asteriscos (*) o indicadores visuales coincidan con la lógica de validación.
- [ ] **Error de servidor:** Simular o forzar un error de red/servidor. Debe mostrar un mensaje de error amigable.
- [ ] **Prevención de doble click:** Hacer click rápido varias veces en el botón de guardar. El botón debe desactivarse tras el primer click válido.
- [ ] **Responsive:** Probar en vista de móvil y desktop. Ningún campo debe desbordar.
- [ ] **Permisos:** Verificar que el usuario tiene los roles necesarios para ver/editar el formulario.

## Riesgos Conocidos

- **Draft Sync:** El sistema de borradores (`useFormDraft`) es local (localStorage). Si el usuario cambia de dispositivo, no verá su borrador.
- **Tienda (Medusa):** Los formularios de la tienda dependen críticamente de que el servidor de Medusa esté operativo.
- **Horarios:** La validación de horas es mediante strings. Un formato incorrecto del backend podría causar errores de visualización si no se sanea.

## Pendientes de Próximos Pasos

- [ ] **Estandarización de Horarios:** Implementar el manejo de `null` para días cerrados/feriados de forma unificada en el esquema y la UI.
- [ ] **Toasts:** Asegurar que todos los formularios del dashboard usen `sonner` de forma consistente para los mensajes de éxito/error.
