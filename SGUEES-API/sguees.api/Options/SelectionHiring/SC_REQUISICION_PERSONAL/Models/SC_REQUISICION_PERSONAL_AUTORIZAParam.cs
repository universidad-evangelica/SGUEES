namespace SGUEES.Models
{
    /// <summary>
    /// Cuerpo del Put Autoriza de requisición de personal (operaciones de flujo 1..5).
    /// Reutilizable desde sc-requisicion-personal u otros componentes que llamen el mismo endpoint.
    /// </summary>
    public class SC_REQUISICION_PERSONAL_AUTORIZAParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_REQUISICION_PERSONAL { get; set; }
        /// <summary>Obligatoria al crear instancia (NUEVO). Si null, el SP toma CORR_UNIDAD de la tabla.</summary>
        public int? CORR_UNIDAD_DOCUMENTO { get; set; }
        /// <summary>1=GUARDAR 2=ENVIAR 3=APROBAR 4=DEVOLVER 5=RECHAZAR</summary>
        public int OPERACION { get; set; }
        /// <summary>Override opcional; si null el SP resuelve por OPERACION.</summary>
        public int? CORR_ACCION { get; set; }
        public string OBSERVACION { get; set; }
    }
}
