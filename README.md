# Schoolify
Proyecto Bases II 2025

# Historias de Usuario - Schoolify

## Autenticación y Perfil de Usuario
- [x] **HU1**: Como usuario, debo poder auto registrarme en la plataforma.
  - Campos requeridos:
    - User name
    - Password (encriptado)
    - Salt (para encriptación)
    - Nombre Completo
    - Fecha de Nacimiento
    - Foto/Avatar

- [x] **HU2**: Como usuario, debo poder editar mi información y cambiarla.

## Gestión de Cursos (Docente)
- [x] **HU3**: Como docente, debo poder crear un curso.
  - Campos del curso:
    - Código
    - Nombre
    - Descripción
    - Fecha de Inicio
    - Fecha de Fin (opcional)
    - Foto

- [x] **HU4**: Como docente, debo poder agregar secciones/temas/subtemas a un curso.
- [x] **HU5**: Como docente, debo poder agregar contenido a las secciones (texto, documentos, videos, imágenes).
- [X] **HU6**: Como docente, debo poder crear evaluaciones (preguntas de selección única con fechas y calificación automática).
- [x] **HU7**: Como docente, debo poder publicar un curso (estados: edición, publicado, activo, cerrado).
- [x] **HU8**: Como docente, debo ver estudiantes matriculados y sus notas (promedio simple).
- [x] **HU9**: Como docente, debo gestionar consultas/respuestas de estudiantes.
- [x] **HU10**: Como docente, debo ver lista de mis cursos (activos, terminados).
- [ ] **HU11**: Como docente, debo poder clonar un curso (copiar materiales, nuevo estado: edición).

## Interacción Estudiantil
- [x] **HU12**: Como estudiante, debo buscar cursos publicados y ver su información.
- [x] **HU13**: Como estudiante, debo matricularme a un curso.
- [x] **HU14**: Como estudiante, debo ver lista de cursos matriculados.
- [x] **HU15**: Como estudiante, debo ver secciones/contenido de un curso.
- [ ] **HU16**: Como estudiante, debo realizar evaluaciones y ver resultado inmediato.
- [ ] **HU17**: Como estudiante, debo ver resultados de todas mis evaluaciones por curso.
- [x] **HU18**: Como estudiante, debo enviar consultas a docentes mediante mensajes.
- [x] **HU19**: Como estudiante, debo ver lista de otros estudiantes en el curso.

## Red Social y Mensajería
- [x] **HU20**: Como usuario, debo poder hacerme amigo de otros usuarios (ver sus cursos como docente/estudiante, sin notas).
- [x] **HU21**: Como usuario, debo buscar otros usuarios en el sistema.
- [x] **HU22**: Como usuario, debo enviar/responder mensajes a otros usuarios.

## To do
- [ ] **HU6**: Se debe arreglar lo de crear evaluaciones
- [ ] **HU8**: Se debe poder ver las notas en la lista de estudiantes
- [ ] **HU11**: Como docente, debo poder clonar un curso (copiar materiales, nuevo estado: edición).
- [ ] **HU16**: Como estudiante, debo realizar evaluaciones y ver resultado inmediato.
- [ ] **HU17**: Como estudiante, debo ver resultados de todas mis evaluaciones por curso.

## Puntos Extra
- [ ] **EXTRA1**: Adjuntar fotos/videos en mensajes entre usuarios (+5 pts).
