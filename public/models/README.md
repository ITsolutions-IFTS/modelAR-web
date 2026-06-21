# Modelos 3D locales (curados same-origin)

Los `.glb` colocados acá se sirven estáticamente por Vite en la raíz del sitio.

## Convención

    public/models/<slug>.glb   →   se sirve en   /models/<slug>.glb

- `<slug>`: kebab-case, sin espacios ni acentos (ej. `silla-eames.glb`).
- Solo formato **GLB** (binario, autocontenido). Same-origin: sin CORS ni URLs firmadas.
- El archivo queda versionado en el repo del front y se despliega con el build.

## Registrar un curado local en el core

El catálogo se arma desde el core, no desde estos archivos. Para que un modelo
local aparezca en `/api/catalog/featured` y sea navegable:

1. Subí el `.glb` a `public/models/<slug>.glb`.
2. Registrá el curado en el **core** (`curated_models`) con:
   - `source = 'local'`
   - `glb_url = '/models/<slug>.glb'` (ruta same-origin)
   - `thumbnail_url`, `name`, `sector?`, `priority`
   - su `uid` en el visor será `local:<id-de-la-fila>` (el prefijo `local:` es
     lo que core y front usan para detectar locales).
3. El core (`getModel` / `getDownloadUrl`) ya resuelve UIDs `local:<id>` igual
   que los de Sketchfab, así que **el visor AR no requiere cambios**.

No hace falta tocar el front para sumar un curado local: alcanza con el `.glb`
acá + el registro en el core.
