namespace scuees.Models
{
    public class COM_REPO_CREView
    {
       public int CORR_EMPRESA { get; set; }
        public int CORR_DOCUMENTO { get; set; }
        public int ANIO_PERIODO { get; set; }
        public string MES_PERIODO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTADO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string SERIE { get; set; }
        public string NUMERO_CRE { get; set; }
        public string NOMBRE_TIPO_DOC_AFECTA { get; set; }
        public string CODIGO_GENERACION { get; set; }
        public string NUMERO_CONTROL { get; set; }
        public string SELLO_RECEPCION { get; set; }
        public DateTime FECHA_DOCUMENTO { get; set; }
        public string CIF { get; set; }
        public string NOMBRE_CLIENTE { get; set; }
        public string DIRECCION_CLIENTE { get; set; }
        public string NOMBRE_DEPTO_CLIENTE { get; set; }
        public string NIT { get; set; }
        public string NCR { get; set; }
        public string GIRO { get; set; }
        public string OBSERVACION { get; set; }
        public decimal TOTAL { get; set; }
        public decimal IVA_RETENIDO { get; set; }
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
