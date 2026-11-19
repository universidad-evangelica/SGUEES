using System;

namespace sguees.Models
{
    public sealed class BecaSolicitudResolucion
    {
        public int CORR_PROSPECTO_BECA { get; set; }
        public byte[] VERSION_REGISTRO { get; set; }
        public string OBSERVACION { get; set; }
    }

    public sealed class BecaSolicitudFlujo
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public byte[] VERSION_REGISTRO { get; set; }
        public string ESTADO_BECA { get; set; }
        public string ESTADO_TEXTO { get; set; }
        public int? CORR_INSTANCIA { get; set; }
        public string NOMBRE_PASO { get; set; }
        public string RESPONSABLE { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_RESOLUCION { get; set; }
        public int? DIAS_EN_PASO { get; set; }
        public string OBSERVACION_RESOLUCION { get; set; }
        public bool PUEDE_INICIAR { get; set; }
        public bool PUEDE_RESOLVER { get; set; }
        public bool PUEDE_MODIFICAR { get; set; }
    }

    public sealed class BecaBitacoraFlujo
    {
        public int CORR_BITACORA { get; set; }
        public DateTime FECHA { get; set; }
        public string USUARIO { get; set; }
        public string PASO { get; set; }
        public string ESTADO_ANTERIOR { get; set; }
        public string ESTADO_NUEVO { get; set; }
        public string COMENTARIO { get; set; }
    }

    public sealed class BecaBitacoraEdicion
    {
        public int CORR_BITACORA_BECA { get; set; }
        public DateTime FECHA { get; set; }
        public string USUARIO { get; set; }
        public string DESCRIPCION { get; set; }
        public string VALOR_ANTERIOR { get; set; }
        public string VALOR_NUEVO { get; set; }
    }
}
