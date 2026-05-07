# Branding API Contract

`GET /api/branding` returns read-only application branding from a temporary mock source.

```json
{
  "success": true,
  "data": {
    "companyName": "Alem",
    "logoUrl": "/uploads/branding/logo.png",
    "tagline": "- Uruguay -"
  }
}
```

`logoUrl` is nullable and should be treated as absent branding artwork when `null`.
Branding editing and management endpoints are intentionally out of scope for now.
