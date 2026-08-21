namespace SGUEES.Models
{
    // Qué hace: cuerpo del Put Autoriza del descriptor (operaciones de flujo 1..6).
    // Cómo lo hace: la API completa CORR_EMPRESA y LOGIN_SISTEMA desde el token;
    //              el repo llama PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA.
    public class SC_DESCRIPTOR_PUESTO_AUTORIZAParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        /// <summary>Obligatoria solo en modo NUEVO (sin instancia). Suele ser CORR_UNIDAD del descriptor.</summary>
        public int? CORR_UNIDAD_DOCUMENTO { get; set; }
        /// <summary>1=GUARDAR 2=ENVIAR 3=APROBAR 4=OBSERVAR 5=INACTIVAR 6=REACTIVAR</summary>
        public int OPERACION { get; set; }
        /// <summary>Override opcional de acción; si null el SP resuelve por OPERACION.</summary>
        public int? CORR_ACCION { get; set; }
        public string OBSERVACION { get; set; }
    }
}
