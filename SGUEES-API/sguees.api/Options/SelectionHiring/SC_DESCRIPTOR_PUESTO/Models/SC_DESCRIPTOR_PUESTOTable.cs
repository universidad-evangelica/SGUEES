using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_PUESTO: encabezado del descriptor de puesto
    // (datos generales, impacto económico, entrenamiento/inducción y estado del flujo de aprobación).
    public class SC_DESCRIPTOR_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_PUESTO { get; set; }
        public int? CORR_UNIDAD { get; set; }
        public DateTime? FECHA_EMISION { get; set; }
        // FK al puesto superior (jefe inmediato) al que reporta este puesto.
        public int? CORR_PUESTO_REPORTA { get; set; }
        public DateTime? FECHA_REVISION { get; set; }
        public int? NUM_PERSONAL_CARGO { get; set; }
        public string OBJETIVO_PUESTO { get; set; }
        // Snapshot: nombre del puesto (GEN_PUESTO) tomado al crear/editar el descriptor, no se recalcula si el catálogo cambia despues.
        public string NOMBRE_PUESTO { get; set; }
        // Snapshot: nombre de la unidad/área organizacional al momento de guardar el descriptor.
        public string NOMBRE_UNIDAD { get; set; }
        // FK al catálogo SC_IMPACTO_ECONOMICO.
        public int? CORR_IMPACTO_ECONOMICO { get; set; }
        // Snapshot: descripción del impacto económico tomada del catálogo al momento de guardar.
        public string DESCRIPCION_IMPACTO_ECONOMICO { get; set; }
        // Responsable de dar seguimiento al entrenamiento/inducción del puesto.
        public string RESPONSABLE { get; set; }
        // Tipo de formato del descriptor: CORTO o EXTENSO.
        public string FORMATO { get; set; }
        // Número de versión del descriptor (permite llevar historial cuando se reactiva un puesto).
        public int? VERSION { get; set; }
        // FK al estado del flujo (SEG_FLUJO_ESTADO).
        public int? CORR_ESTADO { get; set; }
        // Nombre del estado de flujo (snapshot / bandera para UI).
        public string NOMBRE_ESTADO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
