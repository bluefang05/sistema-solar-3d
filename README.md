# Sistema Solar 3D — sitio estático

## Qué es

Simulación 3D del sistema solar en HTML5 + WebGL (Three.js). Las órbitas se
calculan en tiempo real con elementos orbitales reales (J2000) y la ecuación de
Kepler: no hay animaciones prefabricadas.

## Publicación y Despliegue

- **URL en Producción (Netlify):** <https://sistema-solar-3d-959.netlify.app>
- **Repositorio en GitHub:** <https://github.com/bluefang05/sistema-solar-3d>
- **Preview alternativo:** <https://firuhs07k5qvw.space.mcode.io>

## Ejecutar en local

```bash
python -m http.server 8765
# abrir http://127.0.0.1:8765/
```

También funciona abrir `index.html` con doble clic.

## Contenido

- `index.html` — markup y panel de control
- `css/styles.css` — estilos
- `js/main.js` — efemérides, texturas procedurales, escena, física e interfaz
- `vendor/` — Three.js r160 (minificado) + OrbitControls, incluidos para que
  funcione sin CDN y sin conexión
- `favicon.svg` — icono del sitio

## Novedades de la versión 3

- **Plano de la eclíptica** (conmutador): circunferencia con radios cada 30° que
  muestra la referencia geométrica del sistema — se ve cómo cada órbita se inclina
  respecto a ella (Plutón 17°, Urano 2°…).
- **Ficha del Sol**: el Sol ahora tiene panel de datos propio (radio, gravedad
  274 m/s², velocidad de escape 617,6 km/s, rotación de 25,4 días con el eje
  inclinado 7,3°, y su distancia real al baricentro).
- ** magnitudes físicas derivadas**: gravedad superficial y velocidad de escape se
  calculan a partir de la masa y el radio reales de cada cuerpo (no son datos
  escritos a mano), igual que el día sidéreo y el sentido retrógrado de Venus,
  Urano y Plutón.
- **Textura real de la Tierra** (NASA Blue Marble, 1774×887 equirectangular):
  el mapa está en `textures/tierra-blue-marble.jpg` y la Tierra gira según el
  **tiempo sideral de Greenwich**, de modo que las continentes quedan alineadas
  con la posición real del Sol: a las 18:00 UT el punto subsolar cae en los
  89° O, sobre México, y el mapa lo muestra iluminado exactamente ahí.
- **Eje terrestre corregido**: el polo norte se inclina hacia el equinoccio de
  verano, así que el hemisferio norte recibe más luz en junio.
- **Punto subsolar** en la ficha de la Tierra: la longitud geográfica donde el
  Sol está en el cénit.
- **Luna a escala real respecto a la Tierra**: la Luna se dibuja con el 27,3 %
  del diámetro terrestre (antes ocupaba casi el 89 %, el tamaño de un planeta
  gemelo). Al enfocar la Luna, la cámara se sitúa junto a la Tierra, de modo que
  se ve exactamente la misma fase que ve un observador terrestre.
- **Efemérides lunares reales** (series abreviadas de Meeus): longitud, latitud y
  distancia de la Luna, con bloqueo tidal, en lugar de un modelo kepleriano
  simplificado que acumulaba días de error de fase.
- **Eje solar inclinado 7,25°** y rotación ecuatorial de 25,38 días.

## Novedades de la versión 2

- **Baricentro solar**: el Sol ya no está clavado en el centro, sino que orbita
  el baricentro real del sistema (lo hace vibrar de forma visible).
- **Precesión de los ejes**: los ejes planetarios precesan con el ciclo real de
  25.772 años.
- **Fases lunares**: widget con la fase y el porcentaje iluminado actuales.
- **Tercera ley de Kepler**: verificación numérica T²/a³ en el panel de datos.
- **Estaciones y perihelio**: estación boreal actual, próximos solsticios y
  fecha del perihelio terrestre.
- **Atmósferas**: dispersión atmosférica en la Tierra y los gigantes.
- **Escala real de distancias**: conmutador que lleva las órbitas a su
  proporción verdadera (con los tamaños ampliados, como en toda maqueta).
- **Datos curiosos** de cada cuerpo.
- **Movimiento global**: el Sol y sus planetas avanzan juntos por el espacio
  mientras el fondo galáctico gira por detrás.
