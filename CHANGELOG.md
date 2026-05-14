# Changelog – pqrsf-reporte

## [Unreleased] – develop

### Agregado
- Multi-select para **Proceso / Servicio**: checkboxes con etiquetas (tag pills), cierre al hacer clic fuera del componente, y autocompletado automático de `correo_proceso`.
- **Especialidad** convertida a dropdown, cargado dinámicamente desde la tabla `especialidades` de Supabase.
- **Colaborador involucrado**: campo obligatorio con validación en el paso 5 del formulario.

### Corregido
- `autocomplete="off"` en campos de datos personales (`nombre_paciente`, `numero_id`, `telefono`, `direccion`, `email_reporta`) para evitar que el navegador complete información de otros contextos.
- Botón **Enviar** quedaba girando e inhabilitado tras el primer registro: `resetForm()` ahora restablece explícitamente `disabled` e `innerHTML` del botón.
- Llamada a la Edge Function `notify-pqrsf` envuelta en `Promise.race()` con timeout de 6 segundos; si la función no responde el registro ya guardado y el formulario se libera normalmente.

---

## [1.0.0] – master

Versión inicial en producción.
