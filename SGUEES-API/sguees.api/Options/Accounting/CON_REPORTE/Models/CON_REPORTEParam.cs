using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_REPORTEParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string CODIGO_REPORTE { get; set; }
		public DateTime? FECHA_INICIAL { get; set; }
		public DateTime? FECHA_FINAL { get; set; }
		public DateTime? FECHA_IMPRESION { get; set; }
		public int? ANIO_PERIODO { get; set; }
		public int? MES_PERIODO { get; set; }
		public string CUENTA_CONTABLE_INICIAL { get; set; }
		public string CUENTA_CONTABLE_FINAL { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string CUENTA_DEPARTAMENTO { get; set; }
		public string CUENTA_ESPECIFICA { get; set; }
		public string CORR_EMPRESAS { get; set; }
		public int? CORR_CONFI_REPORTE { get; set; }
		public int? CORR_AUXILIAR { get; set; }
		public int? CORR_CENTRO_COSTO { get; set; }
		public int? CORR_MONEDA { get; set; }
		public bool? PARTIDA_CIERRE { get; set; }
		public bool? PARTIDA_LIQUIDACION { get; set; }
		public bool? CUENTA_A_CERO { get; set; }
		public bool? CONSOLIDADO { get; set; }
		public bool? FOLIADO { get; set; }
		public int? NUMERO_FOLIO { get; set; }
		public short? NIVEL { get; set; }
		public string ORIENTACION { get; set; }
		public bool? MUESTRA_FIRMA { get; set; }
	}
}
