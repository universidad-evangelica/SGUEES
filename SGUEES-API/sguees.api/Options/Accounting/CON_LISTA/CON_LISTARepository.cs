using System.Collections.Generic;
using eFramework.Core;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Services
{
	public class CON_LISTARepository : ICON_LISTARepository
	{
		private readonly string _connectionString;

		public CON_LISTARepository(IConfiguration config)
		{
			_connectionString = config.GetConnectionString("defaultConnection") ?? "";
		}

		public CResult GetESTADO_PARTIDA()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "DI", Value = "Digitada" },
				new() { Key = "AP", Value = "Aplicada" },
				new() { Key = "AN", Value = "Anulada" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_PARTIDA()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "NOR", Value = "Normal" },
				new() { Key = "AJU", Value = "Ajuste" },
				new() { Key = "CIE", Value = "Cierre" },
				new() { Key = "APE", Value = "Apertura" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetESTADO_CENTRO_COSTO()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "AC", Value = "Activo" },
				new() { Key = "IN", Value = "Inactivo" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_AUXILIAR()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "BA", Value = "Banco" },
				new() { Key = "CL", Value = "Cliente" },
				new() { Key = "PR", Value = "Proveedor" },
				new() { Key = "EM", Value = "Empleado" },
				new() { Key = "CA", Value = "Caja" },
				new() { Key = "GE", Value = "General" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_RUBRO()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "AC", Value = "Activo" },
				new() { Key = "PA", Value = "Pasivo" },
				new() { Key = "PT", Value = "Patrimonio" },
				new() { Key = "IN", Value = "Ingreso" },
				new() { Key = "CO", Value = "Costo" },
				new() { Key = "GA", Value = "Gasto" },
				new() { Key = "LI", Value = "Liquidadora" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_VALUACION()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "PPP", Value = "Promedio Ponderado" },
				new() { Key = "PEP", Value = "PEPS (FIFO)" },
				new() { Key = "UEP", Value = "UEPS (LIFO)" },
				new() { Key = "IDE", Value = "Identificado" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_VALUACION_CATALOGO_CUENTA()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "HIS", Value = "Histórica" },
				new() { Key = "PRO", Value = "Promedio" },
				new() { Key = "CIE", Value = "Revaluación Cambiaria" },
				new() { Key = "INT", Value = "Moneda Internacional" },
				new() { Key = "SVA", Value = "Sin Valuación" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCLASE_CENTRO_COSTO()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "PR", Value = "Proyecto" },
				new() { Key = "CO", Value = "Costo" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		public CResult GetCORR_TIPO_CENTRO_COSTO()
		{
			return QueryLookup("SELECT CORR_TIPO_CENTRO_COSTO, NOMBRE_TIPO_CENTRO_COSTO FROM V_CON_TIPO_CENTRO_COSTO ORDER BY NOMBRE_TIPO_CENTRO_COSTO");
		}

		public CResult GetCORR_UNIDAD_NEGOCIO()
		{
			return QueryLookup("SELECT CORR_UNIDAD_NEGOCIO, NOMBRE_UNIDAD_NEGOCIO FROM V_CON_UNIDAD_NEGOCIO ORDER BY NOMBRE_UNIDAD_NEGOCIO");
		}

		public CResult GetCORR_AREA_FUNCIONAL()
		{
			return QueryLookup("SELECT CORR_AREA_FUNCIONAL, NOMBRE_AREA_FUNCIONAL FROM V_CON_AREA_FUNCIONAL ORDER BY NOMBRE_AREA_FUNCIONAL");
		}

		public CResult GetCLASE_UNIDAD_NEGOCIO()
		{
			CResult objResultado = new();
			objResultado.Data = new List<CON_LISTAView>()
			{
				new() { Key = "MA", Value = "Masivo" },
				new() { Key = "TI", Value = "Tiendas" },
				new() { Key = "CO", Value = "Corporativo" }
			};
			objResultado.Result = true;
			objResultado.ErrorCode = 0;
			return objResultado;
		}

		private CResult QueryLookup(string sql)
		{
			CResult objResultado = new();
			var list = new List<CON_LISTAView>();
			try
			{
				using var conn = new SqlConnection(_connectionString);
				conn.Open();
				using var cmd = new SqlCommand(sql, conn);
				using var reader = cmd.ExecuteReader();
				while (reader.Read())
				{
					list.Add(new CON_LISTAView
					{
						Key = reader[0],
						Value = reader[1]?.ToString() ?? ""
					});
				}
				objResultado.Data = list;
				objResultado.Result = true;
				objResultado.ErrorCode = 0;
			}
			catch (Exception ex)
			{
				objResultado.Result = false;
				objResultado.ErrorMessage = ex.Message;
				objResultado.ErrorCode = -1;
			}
			return objResultado;
		}
	}
}
