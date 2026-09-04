using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using sgueesRpt.Models;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
{
	// Qué hace: arma DataSet e-Admin para Crystal Formato extenso.
	// Cómo: quita logos del encabezado → GEN_PARAMETRO (patrón Banking/ConPartida).
	internal static class ScDescriptorPuestoFormatoExtensoReportData
	{
		private const string TituloPorDefecto = "Descriptor de Puesto - Formato extenso";

		private static readonly string[] HeaderColumns =
		{
			"NOMBRE_EMPRESA",
			"PERIODO",
			"LOGO1",
			"LOGO2",
			"TITULO_REPORTE",
			"NOMBRE_SISTEMA",
			"FECHA_IMPRESION",
		};

		public static DataSet CreateDataSet(SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload payload)
		{
			if (payload == null) payload = new SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload();

			var encabezadoRows = payload.Encabezado ?? new List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRView>();
			var encabezado = Utils.CreateDataTable(encabezadoRows);
			encabezado.TableName = "V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPR";

			foreach (var columnName in HeaderColumns)
			{
				if (encabezado.Columns.Contains(columnName))
				{
					encabezado.Columns.Remove(columnName);
				}
			}

			var header = encabezadoRows.FirstOrDefault();
			var param = new DataTable("GEN_PARAMETRO");
			param.Columns.Add("CORR_EMPRESA", typeof(int));
			param.Columns.Add("NOMBRE_EMPRESA", typeof(string));
			param.Columns.Add("PERIODO", typeof(string));
			param.Columns.Add("LOGO1", typeof(byte[]));
			param.Columns.Add("LOGO2", typeof(byte[]));
			param.Columns.Add("TITULO_REPORTE", typeof(string));
			param.Columns.Add("NOMBRE_SISTEMA", typeof(string));
			param.Columns.Add("FECHA_IMPRESION", typeof(DateTime));

			if (header != null)
			{
				param.Rows.Add(
					header.CORR_EMPRESA,
					header.NOMBRE_EMPRESA ?? string.Empty,
					header.PERIODO ?? string.Empty,
					header.LOGO1 ?? (object)DBNull.Value,
					header.LOGO2 ?? (object)DBNull.Value,
					string.IsNullOrWhiteSpace(header.TITULO_REPORTE) ? TituloPorDefecto : header.TITULO_REPORTE,
					header.NOMBRE_SISTEMA ?? string.Empty,
					header.FECHA_IMPRESION == default(DateTime) ? DateTime.Now : header.FECHA_IMPRESION);
			}

			var funcionesRows = payload.Funciones
				?? new List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPRView>();
			var funciones = Utils.CreateDataTable(funcionesRows);
			funciones.TableName = "V_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPR";

			var dataSet = new DataSet();
			dataSet.Tables.Add(encabezado);
			dataSet.Tables.Add(param);
			dataSet.Tables.Add(funciones);

			return dataSet;
		}
	}
}
