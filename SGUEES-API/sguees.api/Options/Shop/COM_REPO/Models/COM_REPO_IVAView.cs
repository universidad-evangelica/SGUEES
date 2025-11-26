namespace scuees.Models
{
    public class COM_REPO_IVAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DOCUMENTO { get; set; }
        public int ANIO_PERIODO { get; set; }
        public string MES_PERIODO { get; set; }
        public string NRC_EMPRESA { get; set; }
        public string NIT_EMPRESA { get; set; }
        public string USUARIO_CREA { get; set; }
        public int CORRELATIVO { get; set; }
        public DateTime FECHA_DOCUMENTO { get; set; }
        public string CODIGO_GENERACION { get; set; }
        public string NUMERO_CONTROL { get; set; }
        public string SELLO_RECEPCION { get; set; }
        public string NRC { get; set; }
        public string NIT_DUI { get; set; }
        public string NOMBRE_PROVEEDOR { get; set; }
        public decimal MONTO_COMPRAS_EXE_INTERNAS { get; set; }
        public decimal MONTO_COMPRAS_EXE_IMPORTACIONES { get; set; }
        public decimal MONTO_COMPRAS_GRA_INTERNAS { get; set; }
        public decimal MONTO_COMPRAS_GRA_IMPORTACIONES { get; set; }
        public decimal MONTO_COMPRAS_GRA_CRF{ get; set; }
        public decimal MONTO_ANTICIPO_ACUENTA { get; set; }
        public decimal MONTO_IVA { get; set; }
        public decimal MONTO_TOTAL_COMPRAS { get; set; }
        public decimal MONTO_RETENIDO_TERCEROS { get; set; }
        public decimal MONTO_IVA_RETENIDO { get; set; }
        public decimal MONTO_COMPRAS_SUJETO_EXC { get; set; }
        public string NOMBRE_TIPO_DOC{ get; set; }
        public String URL_CONSULTA { get; set; }
        public Byte[] QR_CONSULTA { get; set; }

        public string NOMBRE_EMPRESA { get; set; }
        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }
    }
}
