# Estructura de Carpetas - Angular 17 Standalone

Este proyecto utiliza Angular 17 con componentes y páginas standalone, aprovechando el nuevo enfoque sin módulos. A continuación, se detalla la estructura de carpetas recomendada para organizar el código de manera eficiente.

## Estructura de Carpetas

```plaintext
/src
  /app
    /core           -> Servicios globales, interceptores, guardias, etc.
    /shared         -> Componentes reutilizables, directivas, pipes, etc.
    /features       -> Características o módulos funcionales, como usuarios, productos, etc.
      /<feature>    -> Ej. /users, /products
        /components -> Componentes standalone específicos de esta característica
        /pages      -> Páginas standalone específicas de esta característica
        /services   -> Servicios específicos de esta característica
        /models     -> Interfaces y tipos específicos de esta característica
    /assets         -> Archivos estáticos como imágenes, fuentes, etc.
    /environments   -> Archivos de configuración de ambientes (prod, dev, etc.)
```

Este `README.md` te servirá como una guía clara para ti y cualquier miembro del equipo que trabaje en el proyecto, asegurando que todos sigan las mismas convenciones.
