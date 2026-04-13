# Mapeo de Esquema Supabase a Firestore

Este documento describe como se estructurarian las colecciones de Firestore para replicar el modelo de datos de Supabase.

## Coleccion: `trainer_profiles`
**ID del Documento:** `{userId}`
```json
{
  "display_name": "string",
  "branch_name": "string",
  "bio": "string",
  "is_active": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Coleccion: `member_profiles`
**ID del Documento:** Autogenerado
```json
{
  "supabase_user_id": "string (Firebase UID)",
  "trainer_user_id": "string (Firebase UID)",
  "member_number": "string",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "status": "string (prospect|active|paused|cancelled|former)",
  "branch_name": "string",
  "notes": "string",
  "join_date": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Coleccion: `member_plan_snapshots`
**ID del Documento:** Autogenerado
```json
{
  "member_id": "string (ID de documento en member_profiles)",
  "label": "string",
  "status": "string (active|paused|cancelled|expired)",
  "started_at": "timestamp",
  "ends_at": "timestamp",
  "notes": "string",
  "is_current": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Coleccion: `site_settings`
**ID del Documento:** `{settingName}` (ej: 'hero', 'topbar', 'routing')
```json
{
  "data": { ... campos variables segun el tipo de setting ... },
  "updated_at": "timestamp"
}
```

## Coleccion: `pickup_requests`
**ID del Documento:** Autogenerado (mapeo desde Medusa Order ID si aplica)
```json
{
  "medusa_order_id": "string",
  "status": "string",
  "customer_id": "string",
  "paypal_charge_id": "string",
  "ledger": [
    {
      "amount": "number",
      "method": "string",
      "timestamp": "timestamp"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
