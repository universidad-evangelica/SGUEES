-- Qué hace: despliega vistas de persona usadas por gen-empleado (API anidada).
-- Cómo lo hace: CREATE OR ALTER de V_GEN_PERSONA, V_GEN_EMPRESA_PERSONA y V_GEN_PERSONA_NATURAL.
-- Ejecutar en BD SGUEES con un usuario con permisos DDL.
:r ..\Views\dbo.V_GEN_PERSONA.sql
:r ..\Views\dbo.V_GEN_EMPRESA_PERSONA.sql
:r ..\Views\dbo.V_GEN_PERSONA_NATURAL.sql
