using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_ESTUDIO (estudios previos del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_ESTUDIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_ESTUDIO { get; set; }
        public string NIVEL_ESTUDIO { get; set; }
        public string SECCION { get; set; }
        public string SECCION_TEXTO { get; set; }
        public int ORDEN_SECCION { get; set; }
        public string NOMBRE_INSTITUCION { get; set; }
        public int? CORR_TIPO_INSTITUCION { get; set; }
        public string TIPO_INSTITUCION_NOMBRE { get; set; }
        public string TIPO_INSTITUCION { get; set; }
        public string TIPO_EDUCACION { get; set; }
        public string TITULO_OBTENIDO { get; set; }
        public int? CORR_GRADO_ACADEMICO { get; set; }
        public string NOMBRE_GRADO { get; set; }
        public int? CORR_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string CARRERA_TEXTO { get; set; }
        public string NIVEL_CURSADO { get; set; }
        public string BACHILLER_OPCION { get; set; }
        public short? ANIO_TITULACION { get; set; }
        public DateTime? FECHA_EGRESO { get; set; }
        public DateTime? FECHA_GRADUACION { get; set; }
        public decimal? CUOTA { get; set; }
        public string QUIEN_PAGO_CUOTA { get; set; }
        public bool GRADUADO { get; set; }
        public bool GRADUADO_UEES { get; set; }
        public int? CORR_PAIS { get; set; }
        public string NOMBRE_PAIS { get; set; }
        public int? CORR_DEPTO { get; set; }
        public string NOMBRE_DEPTO { get; set; }
        public int? CORR_MUNICIPIO { get; set; }
        public string NOMBRE_MUNICIPIO { get; set; }
    }
}
