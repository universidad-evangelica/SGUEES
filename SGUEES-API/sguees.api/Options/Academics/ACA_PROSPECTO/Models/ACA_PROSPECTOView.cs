using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO (listado por ciclo y encabezado del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public string CODIGO_PROSPECTO { get; set; }
        public bool ACTIVO_PROSPECTO { get; set; }
        public int? CORR_PROSPECTO_PERSONA { get; set; }
        public string NOMBRES { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
        public string NOMBRE_COMPLETO { get; set; }
        public string DUI { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public short ANIO { get; set; }
        public byte? NUMERO_PERIODO { get; set; }
        public string CICLO { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public int? CORR_CARRERA { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public int? CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public int? CORR_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string FORMA_INGRESO { get; set; }
        public string FORMA_INGRESO_TEXTO { get; set; }
        public string ESTADO { get; set; }
        public string ESTADO_TEXTO { get; set; }
        public string FINANCIA_ESTUDIOS { get; set; }
        public DateTime FECHA_REGISTRO { get; set; }
    }
}
