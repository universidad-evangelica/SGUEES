// Qué hace: acceso a datos SQL Server para dbo.GEN_EMPLEADO_CONTRATO y dbo.V_GEN_EMPLEADO_CONTRATO.
// Cómo lo hace: consulta historial ligero por empleado, obtiene contexto de plantilla/persona/puesto y ejecuta mutaciones transaccionales protegidas por estado.
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_EMPLEADO_CONTRATORepository : BaseRepository<GEN_EMPLEADO_CONTRATOTable>, IGEN_EMPLEADO_CONTRATORepository
	{
		public GEN_EMPLEADO_CONTRATORepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				 config.GetSection("DbProvider:defaultProvider").Value)
		{ }

		// Qué hace: lista los contratos de un empleado ordenados del más reciente al más antiguo.
		// Cómo lo hace: consulta V_GEN_EMPLEADO_CONTRATO omitiendo CUERPO_CONTRATO para aligerar la grilla.
		public async Task<CResult> GetAllAsync(int corrEmpresa, int corrEmpleado)
		{
			CResult objResultado = new();
			const string sql = @"
SELECT
	CORR_EMPRESA,
	CORR_EMPLEADO_CONTRATO,
	CORR_EMPLEADO,
	CODIGO_EMPLEADO,
	NOMBRE_EMPLEADO,
	DUI,
	CORR_UNIDAD,
	NOMBRE_UNIDAD,
	CORR_PUESTO,
	NOMBRE_PUESTO,
	CORR_PLANTILLA_CONTRATO_VERSION,
	CORR_PLANTILLA_CONTRATO,
	NOMBRE_PLANTILLA,
	CORR_TIPO_CONTRATACION,
	NOMBRE_TIPO_CONTRATACION,
	NUMERO_VERSION,
	NOMBRE_VERSION,
	CAST(N'' AS NVARCHAR(MAX)) AS CUERPO_CONTRATO,
	FECHA_INICIO,
	FECHA_FIN,
	FECHA_FIRMA,
	ESTADO_CONTRATO,
	NOMBRE_ESTADO_CONTRATO,
	NOMBRE_ARCHIVO,
	RUTA_ARCHIVO,
	TIENE_ARCHIVO_FIRMADO,
	FECHA_CARGA,
	MOTIVO_ANULACION,
	USUARIO_CREA,
	ESTACION_CREA,
	FECHA_CREA,
	USUARIO_ACTU,
	ESTACION_ACTU,
	FECHA_ACTU
FROM dbo.V_GEN_EMPLEADO_CONTRATO
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_EMPLEADO = @CORR_EMPLEADO
ORDER BY CORR_EMPLEADO_CONTRATO DESC;";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = DbType.Int32 },
				};
				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				var response = new List<GEN_EMPLEADO_CONTRATOView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: obtiene el detalle completo de un contrato incluyendo su HTML congelado CUERPO_CONTRATO.
		// Cómo lo hace: consulta V_GEN_EMPLEADO_CONTRATO por llave compuesta.
		public async Task<CResult> GetAsync(int corrEmpresa, int corrEmpleadoContrato)
		{
			CResult objResultado = new();
			const string sql = @"
SELECT *
FROM dbo.V_GEN_EMPLEADO_CONTRATO
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_EMPLEADO_CONTRATO", Value = corrEmpleadoContrato, DbType = DbType.Int32 },
				};
				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				var response = new List<GEN_EMPLEADO_CONTRATOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				if (response == null)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = "No se encontró el contrato del empleado.";
				}
				else
				{
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response.CORR_EMPLEADO_CONTRATO;
				}
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: obtiene las plantillas que ya cuentan con versión activa lista para asignar a empleados.
		// Cómo lo hace: une GEN_PLANTILLA_CONTRATO y GEN_PLANTILLA_CONTRATO_VERSION filtrando ES_VERSION_ACTIVA = 1.
		public async Task<CResult> GetPlantillasActivasAsync(int corrEmpresa)
		{
			CResult objResultado = new();
			const string sql = @"
SELECT
	PC.CORR_PLANTILLA_CONTRATO,
	PC.NOMBRE_PLANTILLA,
	PC.CORR_TIPO_CONTRATACION,
	TC.NOMBRE_TIPO_CONTRATACION,
	PV.CORR_PLANTILLA_CONTRATO_VERSION,
	PV.NUMERO_VERSION,
	PV.NOMBRE_VERSION
FROM dbo.GEN_PLANTILLA_CONTRATO PC
INNER JOIN dbo.GEN_PLANTILLA_CONTRATO_VERSION PV
	ON PV.CORR_EMPRESA = PC.CORR_EMPRESA
   AND PV.CORR_PLANTILLA_CONTRATO = PC.CORR_PLANTILLA_CONTRATO
   AND PV.ES_VERSION_ACTIVA = 1
LEFT JOIN dbo.SC_TIPO_CONTRATACION TC
	ON TC.CORR_EMPRESA = PC.CORR_EMPRESA
   AND TC.CORR_TIPO_CONTRATACION = PC.CORR_TIPO_CONTRATACION
WHERE PC.CORR_EMPRESA = @CORR_EMPRESA
ORDER BY PC.NOMBRE_PLANTILLA;";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				};
				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				var response = new List<GEN_PLANTILLA_CONTRATO_ACTIVAView>().FromDataReader(reader).ToList();
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: reúne los datos reales actuales de plantilla, empresa, rectoría, empleado y puesto para congelar un contrato.
		// Cómo lo hace: ejecuta una consulta multiconjunto y mapea cada tabla hacia ContratoContextoData.
		public async Task<ContratoContextoData> GetContextoGeneracionAsync(
			int corrEmpresa,
			int corrEmpleado,
			int corrPlantillaVersion,
			int? corrUnidad,
			int? corrPuesto,
			int? corrMovimiento)
		{
			var ctx = new ContratoContextoData();
			const string sql = @"
-- 1. Versión de plantilla
SELECT TOP 1
	PV.CUERPO_PLANTILLA,
	PC.NOMBRE_PLANTILLA,
	TC.NOMBRE_TIPO_CONTRATACION
FROM dbo.GEN_PLANTILLA_CONTRATO_VERSION PV
INNER JOIN dbo.GEN_PLANTILLA_CONTRATO PC
	ON PC.CORR_EMPRESA = PV.CORR_EMPRESA
   AND PC.CORR_PLANTILLA_CONTRATO = PV.CORR_PLANTILLA_CONTRATO
LEFT JOIN dbo.SC_TIPO_CONTRATACION TC
	ON TC.CORR_EMPRESA = PC.CORR_EMPRESA
   AND TC.CORR_TIPO_CONTRATACION = PC.CORR_TIPO_CONTRATACION
WHERE PV.CORR_EMPRESA = @CORR_EMPRESA
  AND PV.CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION;

-- 2. Empresa
SELECT TOP 1
	NOMBRE_EMPRESA_LARGO,
	NOMBRE_EMPRESA,
	NUMERO_NIT,
	DIRECCION_EMPRESA_LARGO,
	DIRECCION_EMPRESA,
	NOMBRE_REPRESENTANTE_LEGAL,
	NOMBRE_MUNICIPIO
FROM dbo.V_GEN_EMPRESA
WHERE CORR_EMPRESA = @CORR_EMPRESA;

-- 3. Sucursal (dinámico para evitar error de enlace si GEN_SUCURSALES no existe en BD)
IF OBJECT_ID('dbo.GEN_SUCURSALES', 'U') IS NOT NULL
	EXEC sp_executesql N'SELECT TOP 1 NOMBRE_SUCURSAL FROM dbo.V_GEN_SUCURSALES WHERE CORR_EMPRESA = @CORR_EMPRESA ORDER BY CORR_SUCURSAL ASC;', N'@CORR_EMPRESA INT', @CORR_EMPRESA = @CORR_EMPRESA;
ELSE
	SELECT CAST(NULL AS VARCHAR(150)) AS NOMBRE_SUCURSAL;

-- 4. Rector(a) activo desde Organigrama
SELECT TOP 1
	J.NOMBRE_EMPLEADO,
	J.NOMBRE_PUESTO,
	E.DUI,
	PN.EDAD,
	PN.ESTADO_CIVIL,
	FA.TITULO AS PROFESION,
	DOM.DIRECCION
FROM dbo.V_SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES J
LEFT JOIN dbo.V_GEN_EMPLEADO E
	ON E.CORR_EMPRESA = J.CORR_EMPRESA
   AND E.CORR_EMPLEADO = J.CORR_EMPLEADO
LEFT JOIN dbo.V_GEN_PERSONA_NATURAL PN
	ON PN.CORR_PERSONA = E.CORR_PERSONA
OUTER APPLY (
	SELECT TOP 1 F.TITULO
	FROM dbo.V_GEN_PERSONA_FORMACION_ACADEMICA F
	WHERE F.CORR_EMPRESA = J.CORR_EMPRESA
	  AND F.CORR_PERSONA = E.CORR_PERSONA
	ORDER BY F.CORR_FORMACION_ACADEMICA DESC
) FA
OUTER APPLY (
	SELECT TOP 1 D.DIRECCION
	FROM dbo.V_GEN_PERSONA_DOMICILIO D
	WHERE D.CORR_EMPRESA = J.CORR_EMPRESA
	  AND D.CORR_PERSONA = E.CORR_PERSONA
	ORDER BY ISNULL(D.ACTIVO_DOMICILIO, 0) DESC, D.CORR_DOMICILIO DESC
) DOM
WHERE J.CORR_EMPRESA = @CORR_EMPRESA
  AND ISNULL(J.ACTIVO, 0) = 1
  AND (J.NOMBRE_UNIDAD LIKE '%RECTOR%' OR J.NOMBRE_PUESTO LIKE '%RECTOR%')
ORDER BY J.CORR_JEFE ASC;

-- 5. Empleado y persona natural
SELECT TOP 1
	E.CODIGO_EMPLEADO,
	E.NOMBRE_EMPLEADO,
	E.DUI,
	E.NIT,
	PN.EDAD,
	PN.ESTADO_CIVIL,
	PN.NACIONALIDAD,
	FA.TITULO AS PROFESION,
	DOM.DIRECCION,
	DOM.NOMBRE_MUNICIPIO,
	DOM.NOMBRE_DEPTO,
	DOM.NOMBRE_DISTRITO,
	E.CORREO_INSTITUCIONAL,
	ISNULL(NULLIF(LTRIM(RTRIM(ISNULL(E.TELEFONO_1, ''))), ''), E.TELEFONO_INSTITUCIONAL) AS TELEFONO,
	E.FECHA_INGRESO
FROM dbo.V_GEN_EMPLEADO E
LEFT JOIN dbo.V_GEN_PERSONA_NATURAL PN
	ON PN.CORR_PERSONA = E.CORR_PERSONA
OUTER APPLY (
	SELECT TOP 1 F.TITULO
	FROM dbo.V_GEN_PERSONA_FORMACION_ACADEMICA F
	WHERE F.CORR_EMPRESA = E.CORR_EMPRESA
	  AND F.CORR_PERSONA = E.CORR_PERSONA
	ORDER BY F.CORR_FORMACION_ACADEMICA DESC
) FA
OUTER APPLY (
	SELECT TOP 1 D.DIRECCION, D.NOMBRE_MUNICIPIO, D.NOMBRE_DEPTO, D.NOMBRE_DISTRITO
	FROM dbo.V_GEN_PERSONA_DOMICILIO D
	WHERE D.CORR_EMPRESA = E.CORR_EMPRESA
	  AND D.CORR_PERSONA = E.CORR_PERSONA
	ORDER BY ISNULL(D.ACTIVO_DOMICILIO, 0) DESC, D.CORR_DOMICILIO DESC
) DOM
WHERE E.CORR_EMPRESA = @CORR_EMPRESA
  AND E.CORR_EMPLEADO = @CORR_EMPLEADO;

-- 6. Puesto (prioriza activo en GEN_EMPLEADO_PUESTO, si no existe busca en historial)
SELECT TOP 1
	P.NOMBRE_PUESTO,
	P.MISION_PUESTO,
	U.NOMBRE_UNIDAD,
	U.NOMBRE_UNIDAD_PADRE,
	EP.SUELDO,
	EP.HORARIO_LABORAL,
	TC.NOMBRE_TIPO_CONTRATACION,
	TM.MODALIDAD_NOMBRE,
	EP.FECHA_INGRESO,
	CAST(NULL AS DATE) AS FECHA_FIN
FROM dbo.GEN_EMPLEADO_PUESTO EP
LEFT JOIN dbo.PLA_PUESTO P
	ON P.CORR_EMPRESA = EP.CORR_EMPRESA AND P.CORR_PUESTO = EP.CORR_PUESTO
LEFT JOIN dbo.V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES U
	ON U.CORR_EMPRESA = EP.CORR_EMPRESA AND U.CORR_UNIDAD = EP.CORR_UNIDAD
LEFT JOIN dbo.SC_TIPO_CONTRATACION TC
	ON TC.CORR_EMPRESA = EP.CORR_EMPRESA AND TC.CORR_TIPO_CONTRATACION = EP.CORR_TIPO_CONTRATACION
LEFT JOIN dbo.SC_TIPO_MODALIDAD TM
	ON TM.CORR_EMPRESA = EP.CORR_EMPRESA AND TM.CORR_TIPO_MODALIDAD = EP.CORR_TIPO_MODALIDAD
WHERE EP.CORR_EMPRESA = @CORR_EMPRESA
  AND EP.CORR_EMPLEADO = @CORR_EMPLEADO
  AND (@CORR_UNIDAD IS NULL OR EP.CORR_UNIDAD = @CORR_UNIDAD)
  AND (@CORR_PUESTO IS NULL OR EP.CORR_PUESTO = @CORR_PUESTO)
ORDER BY EP.FECHA_INGRESO DESC;

-- 7. Puesto en historial (respaldo si el puesto seleccionado está cerrado)
SELECT TOP 1
	P.NOMBRE_PUESTO,
	P.MISION_PUESTO,
	U.NOMBRE_UNIDAD,
	U.NOMBRE_UNIDAD_PADRE,
	H.SUELDO,
	H.HORARIO_LABORAL,
	TC.NOMBRE_TIPO_CONTRATACION,
	TM.MODALIDAD_NOMBRE,
	H.FECHA_INICIO AS FECHA_INGRESO,
	H.FECHA_FIN
FROM dbo.GEN_EMPLEADO_PUESTO_HISTORIAL H
LEFT JOIN dbo.PLA_PUESTO P
	ON P.CORR_EMPRESA = H.CORR_EMPRESA AND P.CORR_PUESTO = H.CORR_PUESTO
LEFT JOIN dbo.V_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES U
	ON U.CORR_EMPRESA = H.CORR_EMPRESA AND U.CORR_UNIDAD = H.CORR_UNIDAD
LEFT JOIN dbo.SC_TIPO_CONTRATACION TC
	ON TC.CORR_EMPRESA = H.CORR_EMPRESA AND TC.CORR_TIPO_CONTRATACION = H.CORR_TIPO_CONTRATACION
LEFT JOIN dbo.SC_TIPO_MODALIDAD TM
	ON TM.CORR_EMPRESA = H.CORR_EMPRESA AND TM.CORR_TIPO_MODALIDAD = H.CORR_TIPO_MODALIDAD
WHERE H.CORR_EMPRESA = @CORR_EMPRESA
  AND H.CORR_EMPLEADO = @CORR_EMPLEADO
  AND (@CORR_UNIDAD IS NULL OR H.CORR_UNIDAD = @CORR_UNIDAD)
  AND (@CORR_PUESTO IS NULL OR H.CORR_PUESTO = @CORR_PUESTO)
ORDER BY H.FECHA_FIN DESC, H.CORR_EMPLEADO_PUESTO_HISTORIAL DESC;

-- 8. Fecha finalización de movimiento personal (si existe)
SELECT TOP 1
	FECHA_FINALIZACION
FROM dbo.SC_MOVIMIENTO_PERSONAL
WHERE CORR_EMPRESA = @CORR_EMPRESA
  AND CORR_MOVIMIENTO_PERSONAL = @CORR_MOVIMIENTO_PERSONAL;";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = corrPlantillaVersion, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_UNIDAD", Value = corrUnidad.HasValue && corrUnidad > 0 ? corrUnidad.Value : DBNull.Value, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_PUESTO", Value = corrPuesto.HasValue && corrPuesto > 0 ? corrPuesto.Value : DBNull.Value, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_MOVIMIENTO_PERSONAL", Value = corrMovimiento.HasValue && corrMovimiento > 0 ? corrMovimiento.Value : DBNull.Value, DbType = DbType.Int32 },
				};

				var reader = await objData.GetDataReader(CommandType.Text, sql, p);

				if (reader.Read())
				{
					ctx.PlantillaEncontrada = true;
					ctx.CuerpoPlantilla = ReadStr(reader, "CUERPO_PLANTILLA");
					ctx.NombrePlantilla = ReadStr(reader, "NOMBRE_PLANTILLA");
					ctx.NombreTipoContratacionPlantilla = ReadStr(reader, "NOMBRE_TIPO_CONTRATACION");
				}

				if (await reader.NextResultAsync() && reader.Read())
				{
					ctx.EmpresaNombreLargo = ReadStr(reader, "NOMBRE_EMPRESA_LARGO");
					ctx.EmpresaNombre = ReadStr(reader, "NOMBRE_EMPRESA");
					ctx.EmpresaNit = ReadStr(reader, "NUMERO_NIT");
					ctx.EmpresaDireccionLargo = ReadStr(reader, "DIRECCION_EMPRESA_LARGO");
					ctx.EmpresaDireccion = ReadStr(reader, "DIRECCION_EMPRESA");
					ctx.EmpresaRepresentante = ReadStr(reader, "NOMBRE_REPRESENTANTE_LEGAL");
					ctx.EmpresaMunicipio = ReadStr(reader, "NOMBRE_MUNICIPIO");
				}

				if (await reader.NextResultAsync() && reader.Read())
				{
					ctx.SucursalNombre = ReadStr(reader, "NOMBRE_SUCURSAL");
				}

				if (await reader.NextResultAsync() && reader.Read())
				{
					ctx.RectorNombre = ReadStr(reader, "NOMBRE_EMPLEADO");
					ctx.RectorPuesto = ReadStr(reader, "NOMBRE_PUESTO");
					ctx.RectorDui = ReadStr(reader, "DUI");
					ctx.RectorEdad = ReadInt(reader, "EDAD");
					ctx.RectorEstadoCivil = ReadStr(reader, "ESTADO_CIVIL");
					ctx.RectorProfesion = ReadStr(reader, "PROFESION");
					ctx.RectorDomicilio = ReadStr(reader, "DIRECCION");
				}

				if (await reader.NextResultAsync() && reader.Read())
				{
					ctx.EmpleadoEncontrado = true;
					ctx.CodigoEmpleado = ReadStr(reader, "CODIGO_EMPLEADO");
					ctx.EmpleadoNombreCompleto = ReadStr(reader, "NOMBRE_EMPLEADO");
					ctx.EmpleadoDui = ReadStr(reader, "DUI");
					ctx.EmpleadoNit = ReadStr(reader, "NIT");
					ctx.EmpleadoEdad = ReadInt(reader, "EDAD");
					ctx.EmpleadoEstadoCivil = ReadStr(reader, "ESTADO_CIVIL");
					ctx.EmpleadoNacionalidad = ReadStr(reader, "NACIONALIDAD");
					ctx.EmpleadoProfesion = ReadStr(reader, "PROFESION");
					ctx.EmpleadoDireccion = ReadStr(reader, "DIRECCION");
					ctx.EmpleadoMunicipio = ReadStr(reader, "NOMBRE_MUNICIPIO");
					ctx.EmpleadoDepto = ReadStr(reader, "NOMBRE_DEPTO");
					ctx.EmpleadoDistrito = ReadStr(reader, "NOMBRE_DISTRITO");
					ctx.EmpleadoCorreo = ReadStr(reader, "CORREO_INSTITUCIONAL");
					ctx.EmpleadoTelefono = ReadStr(reader, "TELEFONO");
					ctx.EmpleadoFechaIngreso = ReadDate(reader, "FECHA_INGRESO");
				}

				var tienePuestoActivo = await reader.NextResultAsync() && reader.Read();
				if (tienePuestoActivo)
				{
					LeerCamposPuesto(reader, ctx);
				}

				if (await reader.NextResultAsync() && !tienePuestoActivo && reader.Read())
				{
					LeerCamposPuesto(reader, ctx);
				}

				if (await reader.NextResultAsync() && reader.Read())
				{
					ctx.MovimientoFechaFinalizacion = ReadDate(reader, "FECHA_FINALIZACION");
				}

				reader.Close();
			}
			finally
			{
				objData.objConnection.Close();
			}

			return ctx;
		}

		// Qué hace: inserta un nuevo contrato en estado BORRADOR generando el siguiente correlativo por empresa.
		// Cómo lo hace: bloquea la tabla en transacción, calcula MAX + 1, inserta y devuelve la vista resultante.
		public Task<CResult> CreateBorradorAsync(GEN_EMPLEADO_CONTRATOTable Data)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @CORR_CONTRATO INT;
	SELECT @CORR_CONTRATO = ISNULL(MAX(CORR_EMPLEADO_CONTRATO), 0) + 1
	FROM dbo.GEN_EMPLEADO_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA;

	INSERT INTO dbo.GEN_EMPLEADO_CONTRATO
	(
		CORR_EMPRESA,
		CORR_EMPLEADO_CONTRATO,
		CORR_EMPLEADO,
		CORR_UNIDAD,
		CORR_PUESTO,
		CORR_PLANTILLA_CONTRATO_VERSION,
		CUERPO_CONTRATO,
		FECHA_INICIO,
		FECHA_FIN,
		FECHA_FIRMA,
		ESTADO_CONTRATO,
		USUARIO_CREA,
		ESTACION_CREA,
		FECHA_CREA,
		USUARIO_ACTU,
		ESTACION_ACTU,
		FECHA_ACTU
	)
	VALUES
	(
		@CORR_EMPRESA,
		@CORR_CONTRATO,
		@CORR_EMPLEADO,
		@CORR_UNIDAD,
		@CORR_PUESTO,
		@CORR_PLANTILLA_CONTRATO_VERSION,
		@CUERPO_CONTRATO,
		@FECHA_INICIO,
		@FECHA_FIN,
		@FECHA_FIRMA,
		1,
		@USUARIO_CREA,
		@ESTACION_CREA,
		@FECHA_CREA,
		@USUARIO_ACTU,
		@ESTACION_ACTU,
		@FECHA_ACTU
	);

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_EMPLEADO_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK TRAN;
	THROW;
END CATCH;";

			var ahora = Data.FECHA_CREA ?? DateTime.Now;
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = Data.CORR_EMPLEADO, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD > 0 ? Data.CORR_UNIDAD.Value : DBNull.Value, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO.HasValue && Data.CORR_PUESTO > 0 ? Data.CORR_PUESTO.Value : DBNull.Value, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = Data.CORR_PLANTILLA_CONTRATO_VERSION, DbType = DbType.Int32 },
				new() { ParameterName = "CUERPO_CONTRATO", Value = Data.CUERPO_CONTRATO ?? string.Empty, DbType = DbType.String, Size = -1 },
				new() { ParameterName = "FECHA_INICIO", Value = Data.FECHA_INICIO.Date, DbType = DbType.Date },
				new() { ParameterName = "FECHA_FIN", Value = Data.FECHA_FIN.HasValue ? Data.FECHA_FIN.Value.Date : DBNull.Value, DbType = DbType.Date },
				new() { ParameterName = "FECHA_FIRMA", Value = Data.FECHA_FIRMA.HasValue ? Data.FECHA_FIRMA.Value.Date : DBNull.Value, DbType = DbType.Date },
				new() { ParameterName = "USUARIO_CREA", Value = (object)Data.USUARIO_CREA ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "ESTACION_CREA", Value = (object)Data.ESTACION_CREA ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "FECHA_CREA", Value = ahora, DbType = DbType.DateTime },
				new() { ParameterName = "USUARIO_ACTU", Value = (object)Data.USUARIO_ACTU ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "ESTACION_ACTU", Value = (object)Data.ESTACION_ACTU ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = ahora, DbType = DbType.DateTime },
			};

			return ExecuteContratoMutationAsync(sql, p);
		}

		// Qué hace: actualiza un contrato únicamente cuando continúa en estado BORRADOR.
		// Cómo lo hace: verifica existencia y estado BORRADOR dentro de transacción antes de actualizar y devolver la vista.
		public Task<CResult> UpdateBorradorAsync(GEN_EMPLEADO_CONTRATOTable Data)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @ESTADO_ACTUAL INT;
	SELECT TOP 1 @ESTADO_ACTUAL = ESTADO_CONTRATO
	FROM dbo.GEN_EMPLEADO_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	IF @ESTADO_ACTUAL IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró el contrato seleccionado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_ACTUAL <> 1
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'Este contrato ya fue emitido y es inmutable; solo se pueden modificar contratos en estado Borrador.' AS MENSAJE_ERROR;
		RETURN;
	END;

	UPDATE dbo.GEN_EMPLEADO_CONTRATO
	SET CORR_UNIDAD = @CORR_UNIDAD,
		CORR_PUESTO = @CORR_PUESTO,
		CORR_PLANTILLA_CONTRATO_VERSION = @CORR_PLANTILLA_CONTRATO_VERSION,
		CUERPO_CONTRATO = @CUERPO_CONTRATO,
		FECHA_INICIO = @FECHA_INICIO,
		FECHA_FIN = @FECHA_FIN,
		FECHA_FIRMA = @FECHA_FIRMA,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_EMPLEADO_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK TRAN;
	THROW;
END CATCH;";

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO_CONTRATO", Value = Data.CORR_EMPLEADO_CONTRATO, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD.HasValue && Data.CORR_UNIDAD > 0 ? Data.CORR_UNIDAD.Value : DBNull.Value, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO.HasValue && Data.CORR_PUESTO > 0 ? Data.CORR_PUESTO.Value : DBNull.Value, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_PLANTILLA_CONTRATO_VERSION", Value = Data.CORR_PLANTILLA_CONTRATO_VERSION, DbType = DbType.Int32 },
				new() { ParameterName = "CUERPO_CONTRATO", Value = Data.CUERPO_CONTRATO ?? string.Empty, DbType = DbType.String, Size = -1 },
				new() { ParameterName = "FECHA_INICIO", Value = Data.FECHA_INICIO.Date, DbType = DbType.Date },
				new() { ParameterName = "FECHA_FIN", Value = Data.FECHA_FIN.HasValue ? Data.FECHA_FIN.Value.Date : DBNull.Value, DbType = DbType.Date },
				new() { ParameterName = "FECHA_FIRMA", Value = Data.FECHA_FIRMA.HasValue ? Data.FECHA_FIRMA.Value.Date : DBNull.Value, DbType = DbType.Date },
				new() { ParameterName = "USUARIO_ACTU", Value = (object)Data.USUARIO_ACTU ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "ESTACION_ACTU", Value = (object)Data.ESTACION_ACTU ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU ?? DateTime.Now, DbType = DbType.DateTime },
			};

			return ExecuteContratoMutationAsync(sql, p);
		}

		// Qué hace: ejecuta transiciones legales de estado (Emitir, Finalizar, Anular) sobre GEN_EMPLEADO_CONTRATO.
		// Cómo lo hace: valida en transacción el estado permitido según la acción, actualiza ESTADO_CONTRATO y retorna la vista.
		public Task<CResult> CambiarEstadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			int estadoDestino,
			int? estadoRequerido,
			string motivoAnulacion,
			string login,
			string estacion)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @ESTADO_ACTUAL INT;
	SELECT TOP 1 @ESTADO_ACTUAL = ESTADO_CONTRATO
	FROM dbo.GEN_EMPLEADO_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	IF @ESTADO_ACTUAL IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró el contrato seleccionado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_ACTUAL = 4
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'El contrato ya se encuentra anulado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_ACTUAL = 3
	BEGIN
		ROLLBACK TRAN;
		SELECT -3 AS RESULTADO_OP, 'El contrato ya está finalizado y no admite cambios de estado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_REQUERIDO IS NOT NULL AND @ESTADO_ACTUAL <> @ESTADO_REQUERIDO
	BEGIN
		ROLLBACK TRAN;
		SELECT -4 AS RESULTADO_OP, 'El estado actual del contrato no permite realizar esta acción.' AS MENSAJE_ERROR;
		RETURN;
	END;

	UPDATE dbo.GEN_EMPLEADO_CONTRATO
	SET ESTADO_CONTRATO = @ESTADO_DESTINO,
		FECHA_FIN = CASE WHEN @ESTADO_DESTINO = 3 THEN CAST(GETDATE() AS DATE) ELSE FECHA_FIN END,
		MOTIVO_ANULACION = CASE WHEN @ESTADO_DESTINO = 4 THEN @MOTIVO_ANULACION ELSE MOTIVO_ANULACION END,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_EMPLEADO_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK TRAN;
	THROW;
END CATCH;";

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO_CONTRATO", Value = corrEmpleadoContrato, DbType = DbType.Int32 },
				new() { ParameterName = "ESTADO_DESTINO", Value = estadoDestino, DbType = DbType.Int32 },
				new() { ParameterName = "ESTADO_REQUERIDO", Value = (object)estadoRequerido ?? DBNull.Value, DbType = DbType.Int32 },
				new() { ParameterName = "MOTIVO_ANULACION", Value = (object)motivoAnulacion ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "USUARIO_ACTU", Value = (object)login ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "ESTACION_ACTU", Value = (object)estacion ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = DateTime.Now, DbType = DbType.DateTime },
			};

			return ExecuteContratoMutationAsync(sql, p);
		}

		// Qué hace: registra el nombre, ruta interna y fecha de carga del documento firmado subido por el usuario.
		// Cómo lo hace: verifica en transacción que el contrato no esté ANULADO, actualiza columnas de archivo y devuelve la vista.
		public Task<CResult> ActualizarArchivoFirmadoAsync(
			int corrEmpresa,
			int corrEmpleadoContrato,
			string nombreArchivo,
			string rutaArchivo,
			string login,
			string estacion)
		{
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @ESTADO_ACTUAL INT;
	SELECT TOP 1 @ESTADO_ACTUAL = ESTADO_CONTRATO
	FROM dbo.GEN_EMPLEADO_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	IF @ESTADO_ACTUAL IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró el contrato seleccionado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_ACTUAL = 4
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'No se puede adjuntar documento firmado a un contrato anulado.' AS MENSAJE_ERROR;
		RETURN;
	END;

	UPDATE dbo.GEN_EMPLEADO_CONTRATO
	SET NOMBRE_ARCHIVO = @NOMBRE_ARCHIVO,
		RUTA_ARCHIVO = @RUTA_ARCHIVO,
		FECHA_CARGA = @FECHA_ACTU,
		USUARIO_ACTU = @USUARIO_ACTU,
		ESTACION_ACTU = @ESTACION_ACTU,
		FECHA_ACTU = @FECHA_ACTU
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	COMMIT TRAN;

	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;

	SELECT *
	FROM dbo.V_GEN_EMPLEADO_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK TRAN;
	THROW;
END CATCH;";

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO_CONTRATO", Value = corrEmpleadoContrato, DbType = DbType.Int32 },
				new() { ParameterName = "NOMBRE_ARCHIVO", Value = (object)nombreArchivo ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "RUTA_ARCHIVO", Value = (object)rutaArchivo ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "USUARIO_ACTU", Value = (object)login ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "ESTACION_ACTU", Value = (object)estacion ?? DBNull.Value, DbType = DbType.String },
				new() { ParameterName = "FECHA_ACTU", Value = DateTime.Now, DbType = DbType.DateTime },
			};

			return ExecuteContratoMutationAsync(sql, p);
		}

		// Qué hace: elimina un contrato únicamente si permanece en estado BORRADOR.
		// Cómo lo hace: verifica el estado en transacción antes de ejecutar DELETE y retorna resultado operativo.
		public async Task<CResult> DeleteBorradorAsync(int corrEmpresa, int corrEmpleadoContrato)
		{
			CResult objResultado = new();
			const string sql = @"
SET NOCOUNT ON;
BEGIN TRY
	BEGIN TRAN;

	DECLARE @ESTADO_ACTUAL INT;
	SELECT TOP 1 @ESTADO_ACTUAL = ESTADO_CONTRATO
	FROM dbo.GEN_EMPLEADO_CONTRATO WITH (UPDLOCK, HOLDLOCK)
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	IF @ESTADO_ACTUAL IS NULL
	BEGIN
		ROLLBACK TRAN;
		SELECT -1 AS RESULTADO_OP, 'No se encontró el contrato a eliminar.' AS MENSAJE_ERROR;
		RETURN;
	END;

	IF @ESTADO_ACTUAL <> 1
	BEGIN
		ROLLBACK TRAN;
		SELECT -2 AS RESULTADO_OP, 'Solo se pueden eliminar contratos en estado Borrador; los emitidos deben anularse o finalizarse.' AS MENSAJE_ERROR;
		RETURN;
	END;

	DELETE FROM dbo.GEN_EMPLEADO_CONTRATO
	WHERE CORR_EMPRESA = @CORR_EMPRESA
	  AND CORR_EMPLEADO_CONTRATO = @CORR_EMPLEADO_CONTRATO;

	COMMIT TRAN;
	SELECT 0 AS RESULTADO_OP, '' AS MENSAJE_ERROR;
END TRY
BEGIN CATCH
	IF @@TRANCOUNT > 0 ROLLBACK TRAN;
	THROW;
END CATCH;";

			try
			{
				var p = new List<CParameter>
				{
					new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "CORR_EMPLEADO_CONTRATO", Value = corrEmpleadoContrato, DbType = DbType.Int32 },
				};
				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				var resultadoOp = -1;
				var mensaje = "No se pudo eliminar el contrato.";
				if (reader.Read())
				{
					resultadoOp = Convert.ToInt32(reader["RESULTADO_OP"]);
					mensaje = reader["MENSAJE_ERROR"]?.ToString() ?? string.Empty;
				}
				reader.Close();

				objResultado.Result = resultadoOp == 0;
				objResultado.ErrorCode = resultadoOp == 0 ? 0 : -1;
				objResultado.ErrorMessage = resultadoOp == 0 ? string.Empty : mensaje;
				objResultado.RowsAffected = resultadoOp == 0 ? 1 : 0;
				objResultado.CodeHelper = corrEmpleadoContrato;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		// Qué hace: ejecuta comandos transaccionales que retornan estado operativo y la fila resultante de V_GEN_EMPLEADO_CONTRATO.
		// Cómo lo hace: lee RESULTADO_OP/MENSAJE_ERROR del primer conjunto y materializa GEN_EMPLEADO_CONTRATOView del segundo.
		private async Task<CResult> ExecuteContratoMutationAsync(string sql, List<CParameter> parameters)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader(CommandType.Text, sql, parameters);
				var resultadoOp = -1;
				var mensaje = "No se pudo completar la operación sobre el contrato.";

				if (reader.Read())
				{
					resultadoOp = Convert.ToInt32(reader["RESULTADO_OP"]);
					mensaje = reader["MENSAJE_ERROR"]?.ToString() ?? string.Empty;
				}

				if (resultadoOp != 0)
				{
					reader.Close();
					objResultado.Result = false;
					objResultado.ErrorCode = -1;
					objResultado.ErrorMessage = mensaje;
					objResultado.ErrorSource = "[GEN_EMPLEADO_CONTRATORepository]";
					return objResultado;
				}

				GEN_EMPLEADO_CONTRATOView response = null;
				if (await reader.NextResultAsync())
				{
					response = new List<GEN_EMPLEADO_CONTRATOView>().FromDataReader(reader).FirstOrDefault();
				}
				reader.Close();

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_EMPLEADO_CONTRATO ?? 0;
			}
			catch (Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private static void LeerCamposPuesto(IDataReader reader, ContratoContextoData ctx)
		{
			ctx.NombrePuesto = ReadStr(reader, "NOMBRE_PUESTO");
			ctx.MisionPuesto = ReadStr(reader, "MISION_PUESTO");
			ctx.NombreUnidad = ReadStr(reader, "NOMBRE_UNIDAD");
			ctx.NombreUnidadPadre = ReadStr(reader, "NOMBRE_UNIDAD_PADRE");
			ctx.SalarioMensual = ReadDecimal(reader, "SUELDO");
			ctx.HorarioLaboral = ReadStr(reader, "HORARIO_LABORAL");
			ctx.TipoContratacionPuesto = ReadStr(reader, "NOMBRE_TIPO_CONTRATACION");
			ctx.ModalidadTrabajo = ReadStr(reader, "MODALIDAD_NOMBRE");
			ctx.PuestoFechaIngreso = ReadDate(reader, "FECHA_INGRESO");
			ctx.PuestoFechaFin = ReadDate(reader, "FECHA_FIN");
		}

		private static string ReadStr(IDataReader reader, string column)
		{
			var value = reader[column];
			return value == DBNull.Value ? string.Empty : value?.ToString()?.Trim() ?? string.Empty;
		}

		private static int? ReadInt(IDataReader reader, string column)
		{
			var value = reader[column];
			return value == DBNull.Value ? null : Convert.ToInt32(value);
		}

		private static decimal? ReadDecimal(IDataReader reader, string column)
		{
			var value = reader[column];
			return value == DBNull.Value ? null : Convert.ToDecimal(value);
		}

		private static DateTime? ReadDate(IDataReader reader, string column)
		{
			var value = reader[column];
			return value == DBNull.Value ? null : Convert.ToDateTime(value);
		}

		private static void SetError(CResult objResultado, Exception e)
		{
			objResultado.Data = null;
			objResultado.Result = false;
			objResultado.RowsAffected = 0;
			objResultado.CodeHelper = 0;
			objResultado.ErrorCode = -1;
			objResultado.ErrorMessage = e.Message;
			objResultado.ErrorSource += $"[{e.Source}]";
		}

		// Qué hace: consulta si ya existe un contrato BORRADOR o VIGENTE para ese empleado y puesto.
		// Cómo lo hace: ejecuta un COUNT vía ExecCmd(xRowsAfected:false) sobre GEN_EMPLEADO_CONTRATO con filtros de empresa, empleado, puesto y estado activo.
		public async Task<bool> ExisteContratoActivoParaPuestoAsync(int corrEmpresa, int corrEmpleado, int corrPuesto)
		{
			const string sql = @"
SELECT COUNT(1)
FROM   dbo.GEN_EMPLEADO_CONTRATO
WHERE  CORR_EMPRESA   = @CORR_EMPRESA
  AND  CORR_EMPLEADO  = @CORR_EMPLEADO
  AND  CORR_PUESTO    = @CORR_PUESTO
  AND  ESTADO_CONTRATO IN (1, 2);";

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA",  Value = corrEmpresa,  DbType = DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = corrEmpleado, DbType = DbType.Int32 },
				new() { ParameterName = "CORR_PUESTO",   Value = corrPuesto,   DbType = DbType.Int32 },
			};

			try
			{
				var scalar = await objData.ExecCmd(CommandType.Text, sql, xRowsAfected: false, xParametros: p);
				return Convert.ToInt32(scalar) > 0;
			}
			catch
			{
				return false;
			}
		}
	}
}

