using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using DevExpress.XtraReports.UI;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.Accounting.CON_PARTIDA.DxReports
{
	/// <summary>
	/// Partida contable DevExpress — diseño en PARTIDA_CONTABLE_DXReport.Designer.cs (visible en [Diseño] de VS).
	/// </summary>
	public partial class PARTIDA_CONTABLE_DXReport : XtraReport
	{
		public PARTIDA_CONTABLE_DXReport()
		{
			InitializeComponent();
			ConfigureParameters();
		}

		/// <summary>
		/// Carga desde PRAL_IMPR_CON_PARTIDA_CONTABLE (visor Accounting.aspx).
		/// Misma lógica de fusión detalle+encabezado que CON_PARTIDARepository.GetConPartidaImpr.
		/// </summary>
		public void LoadFromDatabase(
			int corrEmpresa,
			int anioPeriodo,
			int mesPeriodo,
			int corrClasePartida,
			int corrPartida)
		{
			var cs = ConfigurationManager.ConnectionStrings["SgueesDb"];
			if (cs == null || string.IsNullOrWhiteSpace(cs.ConnectionString))
			{
				throw new InvalidOperationException(
					"Falta ConnectionString 'SgueesDb' en Web.config. Configure Data Source, Initial Catalog, User Id y Password.");
			}

			// SqlDataAdapter.Fill carga los 2 result sets del SP (detalle + encabezado empresa).
			// DataTable.Load(reader) solo consume el 1.º e ignora el 2.º → NOMBRE_EMPRESA quedaba vacío.
			DataTable detail;
			DataTable header;
			using (var cn = new SqlConnection(cs.ConnectionString))
			using (var cmd = new SqlCommand("dbo.PRAL_IMPR_CON_PARTIDA_CONTABLE", cn))
			using (var da = new SqlDataAdapter(cmd))
			{
				cmd.CommandType = CommandType.StoredProcedure;
				cmd.Parameters.Add("@CORR_EMPRESA", SqlDbType.Int).Value = corrEmpresa;
				// Impresión de una partida: sin filtro de fechas (igual que API LoadPartidaImprRowsAsync).
				cmd.Parameters.Add("@FECHA_INICIAL", SqlDbType.Date).Value = DBNull.Value;
				cmd.Parameters.Add("@FECHA_FINAL", SqlDbType.Date).Value = DBNull.Value;
				cmd.Parameters.Add("@ANIO_PERIODO", SqlDbType.Int).Value = anioPeriodo;
				cmd.Parameters.Add("@MES_PERIODO", SqlDbType.Int).Value = mesPeriodo;
				cmd.Parameters.Add("@CORR_CLASE_PARTIDA", SqlDbType.Int).Value = corrClasePartida;
				cmd.Parameters.Add("@CORR_PARTIDA", SqlDbType.Int).Value = corrPartida;
				cmd.Parameters.Add("@CORR_PARTIDA_INICIAL", SqlDbType.Int).Value = 0;
				cmd.Parameters.Add("@CORR_PARTIDA_FINAL", SqlDbType.Int).Value = 0;
				cmd.Parameters.Add("@FOLIADO", SqlDbType.Bit).Value = false;
				cmd.Parameters.Add("@NUMERO_FOLIO", SqlDbType.Int).Value = 0;
				cmd.Parameters.Add("@CORR_MONEDA", SqlDbType.Int).Value = 0;
				cmd.Parameters.Add("@OPCION_CONSULTA", SqlDbType.Int).Value = 0;

				var ds = new DataSet();
				da.Fill(ds);
				detail = ds.Tables.Count > 0 ? ds.Tables[0] : new DataTable();
				header = ds.Tables.Count > 1 ? ds.Tables[1] : new DataTable();
			}

			if (detail.Rows.Count == 0)
			{
				throw new InvalidOperationException(
					$"No hay datos para CORR_EMPRESA={corrEmpresa}, ANIO={anioPeriodo}, MES={mesPeriodo}, CLASE={corrClasePartida}, PARTIDA={corrPartida}.");
			}

			MergeHeaderIntoDetail(detail, header);
			EnrichPrintRows(detail);
			Bind(MapToViewList(detail));
		}

		/// <summary>
		/// Bind directo (PDF API AccountingPartidaDxController).
		/// </summary>
		public void Bind(List<CON_PARTIDA_IMPRView> rows)
		{
			var data = rows ?? new List<CON_PARTIDA_IMPRView>();
			var first = data.FirstOrDefault();
			if (first != null)
			{
				Parameters["NOMBRE_EMPRESA"].Value = first.NOMBRE_EMPRESA ?? string.Empty;
				Parameters["TITULO_REPORTE"].Value = string.IsNullOrWhiteSpace(first.TITULO_REPORTE)
					? "Partida Contable"
					: first.TITULO_REPORTE;
				Parameters["USUARIO_DIGITA"].Value = first.USUARIO_CREA ?? string.Empty;
			}

			DataSource = data;
		}

		private void ConfigureParameters()
		{
			AddHiddenParam("NOMBRE_EMPRESA", typeof(string), string.Empty);
			AddHiddenParam("TITULO_REPORTE", typeof(string), "Partida Contable");
			AddHiddenParam("USUARIO_DIGITA", typeof(string), string.Empty);
		}

		private void AddHiddenParam(string name, Type type, object defaultValue)
		{
			Parameters.Add(new global::DevExpress.XtraReports.Parameters.Parameter
			{
				Name = name,
				Type = type,
				Value = defaultValue,
				Visible = false,
			});
		}

		private static void MergeHeaderIntoDetail(DataTable detail, DataTable header)
		{
			if (header == null || header.Rows.Count == 0)
			{
				return;
			}

			var h = header.Rows[0];
			CopyHeaderCol(detail, h, "NOMBRE_EMPRESA");
			CopyHeaderCol(detail, h, "PERIODO");
			CopyHeaderCol(detail, h, "LOGO1");
			CopyHeaderCol(detail, h, "LOGO2");
			CopyHeaderCol(detail, h, "TITULO_REPORTE");
			CopyHeaderCol(detail, h, "NOMBRE_SISTEMA");
			CopyHeaderCol(detail, h, "FECHA_IMPRESION");
		}

		private static void CopyHeaderCol(DataTable detail, DataRow headerRow, string column)
		{
			if (!headerRow.Table.Columns.Contains(column) || headerRow[column] == DBNull.Value)
			{
				return;
			}

			if (!detail.Columns.Contains(column))
			{
				detail.Columns.Add(column, headerRow[column].GetType());
			}

			foreach (DataRow row in detail.Rows)
			{
				row[column] = headerRow[column];
			}
		}

		private static void EnrichPrintRows(DataTable detail)
		{
			if (detail.Rows.Count == 0)
			{
				return;
			}

			EnsureStringCol(detail, "PERIODO");
			EnsureStringCol(detail, "TITULO_REPORTE");
			EnsureStringCol(detail, "NOMBRE_SISTEMA");
			EnsureCol(detail, "FECHA_IMPRESION", typeof(DateTime));

			var first = detail.Rows[0];
			var anio = GetInt(first, "ANIO_PERIODO");
			var mes = GetInt(first, "MES_PERIODO");
			var periodo = anio > 0 && mes > 0 ? string.Format("{0:D2}/{1}", mes, anio) : string.Empty;
			var fechaImpresion = GetDateOrNow(first, "FECHA_IMPRESION");

			foreach (DataRow row in detail.Rows)
			{
				if (string.IsNullOrWhiteSpace(Convert.ToString(row["PERIODO"])))
				{
					row["PERIODO"] = periodo;
				}
				if (string.IsNullOrWhiteSpace(Convert.ToString(row["TITULO_REPORTE"])))
				{
					row["TITULO_REPORTE"] = "Partida Contable";
				}
				if (string.IsNullOrWhiteSpace(Convert.ToString(row["NOMBRE_SISTEMA"])))
				{
					row["NOMBRE_SISTEMA"] = "SGUEES";
				}
				if (row["FECHA_IMPRESION"] == DBNull.Value || Convert.ToDateTime(row["FECHA_IMPRESION"]) == default(DateTime))
				{
					row["FECHA_IMPRESION"] = fechaImpresion;
				}
			}
		}

		private static List<CON_PARTIDA_IMPRView> MapToViewList(DataTable detail)
		{
			var list = new List<CON_PARTIDA_IMPRView>(detail.Rows.Count);
			foreach (DataRow r in detail.Rows)
			{
				list.Add(new CON_PARTIDA_IMPRView
				{
					CORR_EMPRESA = GetInt(r, "CORR_EMPRESA"),
					ANIO_PERIODO = GetInt(r, "ANIO_PERIODO"),
					MES_PERIODO = GetInt(r, "MES_PERIODO"),
					CORR_CLASE_PARTIDA = GetInt(r, "CORR_CLASE_PARTIDA"),
					NOMBRE_CLASE_PARTIDA = GetString(r, "NOMBRE_CLASE_PARTIDA"),
					NOMBRE_CORTO_CLASE = GetString(r, "NOMBRE_CORTO_CLASE"),
					CORR_PARTIDA = GetInt(r, "CORR_PARTIDA"),
					NUMERO_PARTIDA = GetInt(r, "NUMERO_PARTIDA", GetInt(r, "CORR_PARTIDA")),
					FECHA_PARTIDA = GetDateOrDefault(r, "FECHA_PARTIDA"),
					NUMERO_DOCUMENTO = GetString(r, "NUMERO_DOCUMENTO"),
					NOMBRE_PARTIDA = GetString(r, "NOMBRE_PARTIDA"),
					ESTADO_PARTIDA = GetString(r, "ESTADO_PARTIDA"),
					NOMBRE_ESTADO_PARTIDA = GetString(r, "NOMBRE_ESTADO_PARTIDA"),
					USUARIO_CREA = GetString(r, "USUARIO_CREA"),
					FECHA_CREA = GetDateOrDefault(r, "FECHA_CREA"),
					ESTACION_CREA = GetString(r, "ESTACION_CREA"),
					USUARIO_ACTU = GetString(r, "USUARIO_ACTU"),
					FECHA_ACTU = GetDateOrDefault(r, "FECHA_ACTU"),
					ESTACION_ACTU = GetString(r, "ESTACION_ACTU"),
					CLASE_PARTIDA = GetString(r, "CLASE_PARTIDA"),
					NOMBRE_CLASE_PARTIDA2 = GetString(r, "NOMBRE_CLASE_PARTIDA2"),
					CORR_PARTIDA_DETA = GetInt(r, "CORR_PARTIDA_DETA"),
					CUENTA_CONTABLE = GetString(r, "CUENTA_CONTABLE"),
					NOMBRE_CUENTA = GetString(r, "NOMBRE_CUENTA"),
					CORR_CENTRO_COSTO = GetInt(r, "CORR_CENTRO_COSTO"),
					CODIGO_CENTRO_COSTO = GetString(r, "CODIGO_CENTRO_COSTO"),
					NOMBRE_CENTRO = GetString(r, "NOMBRE_CENTRO"),
					MONTO_CARGO = GetDecimal(r, "MONTO_CARGO"),
					MONTO_ABONO = GetDecimal(r, "MONTO_ABONO"),
					NOMBRE_TRAN = GetString(r, "NOMBRE_TRAN"),
					NUMERO_DOCUMENTO_DETA = GetString(r, "NUMERO_DOCUMENTO_DETA"),
					CORR_AUXILIAR = GetString(r, "CORR_AUXILIAR"),
					CORR_AUXILIAR_REPLICADO = GetString(r, "CORR_AUXILIAR_REPLICADO"),
					CORR_CENTRO_COSTO_REPLICADO = GetString(r, "CORR_CENTRO_COSTO_REPLICADO"),
					DESCRIPCION_MONEDA = GetString(r, "DESCRIPCION_MONEDA"),
					MOSTRAR_FECHA_IMPRESION = GetBool(r, "MOSTRAR_FECHA_IMPRESION"),
					FOLIADO = GetBool(r, "FOLIADO"),
					NUMERO_FOLIO = GetInt(r, "NUMERO_FOLIO"),
					NOMBRE_MONEDA = GetString(r, "NOMBRE_MONEDA"),
					CUENTA_MAYOR = GetString(r, "CUENTA_MAYOR"),
					NOMBRE_CUENTA_MAYOR = GetString(r, "NOMBRE_CUENTA_MAYOR"),
					NOMBRE_EMPRESA = GetString(r, "NOMBRE_EMPRESA"),
					PERIODO = GetString(r, "PERIODO"),
					LOGO1 = GetBytes(r, "LOGO1"),
					LOGO2 = GetBytes(r, "LOGO2"),
					TITULO_REPORTE = GetString(r, "TITULO_REPORTE"),
					NOMBRE_SISTEMA = GetString(r, "NOMBRE_SISTEMA"),
					FECHA_IMPRESION = GetDateOrNow(r, "FECHA_IMPRESION"),
				});
			}
			return list;
		}

		private static void EnsureStringCol(DataTable t, string name)
		{
			if (!t.Columns.Contains(name))
			{
				t.Columns.Add(name, typeof(string));
			}
		}

		private static void EnsureCol(DataTable t, string name, Type type)
		{
			if (!t.Columns.Contains(name))
			{
				t.Columns.Add(name, type);
			}
		}

		private static int GetInt(DataRow r, string col, int fallback = 0)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return fallback;
			}
			return Convert.ToInt32(r[col]);
		}

		private static decimal GetDecimal(DataRow r, string col)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return 0m;
			}
			return Convert.ToDecimal(r[col]);
		}

		private static bool GetBool(DataRow r, string col)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return false;
			}
			return Convert.ToBoolean(r[col]);
		}

		private static string GetString(DataRow r, string col)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return string.Empty;
			}
			return Convert.ToString(r[col]) ?? string.Empty;
		}

		private static DateTime GetDateOrDefault(DataRow r, string col)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return default(DateTime);
			}
			return Convert.ToDateTime(r[col]);
		}

		private static DateTime GetDateOrNow(DataRow r, string col)
		{
			var d = GetDateOrDefault(r, col);
			return d == default(DateTime) ? DateTime.Now : d;
		}

		private static byte[] GetBytes(DataRow r, string col)
		{
			if (!r.Table.Columns.Contains(col) || r[col] == DBNull.Value)
			{
				return null;
			}
			return r[col] as byte[];
		}
	}
}
