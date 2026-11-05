using System;
namespace SGUEES.Models
{
 public sealed class BecaFormularioCambio {
  public int CORR_EMPRESA {get;set;} public int CORR_BECA {get;set;} public int ID {get;set;}
  public int? CORR_FORMULARIO_BECA {get;set;} public int? CORR_VERSION_ORIGEN {get;set;} public int? CORR_BECA_PLANTILLA {get;set;}
  public string CODIGO_FORMULARIO {get;set;} public string NOMBRE_FORMULARIO {get;set;} public string DESCRIPCION {get;set;}
  public string VERSION_FORMULARIO {get;set;} public DateTime? FECHA_INICIO {get;set;} public DateTime? FECHA_FIN {get;set;}
  public short? ANIO_ADMISION {get;set;} public byte? NUMERO_PERIODO_ADMISION {get;set;} public byte[] VERSION_REGISTRO {get;set;}
 }
 public sealed class BecaFormularioFila {
  public int CORR_FORMULARIO_BECA {get;set;} public string CODIGO_FORMULARIO {get;set;} public string NOMBRE_FORMULARIO {get;set;}
  public string DESCRIPCION {get;set;} public bool ACTIVO {get;set;} public byte[] VERSION_REGISTRO {get;set;}
 }
 public sealed class BecaVersionFila {
  public int CORR_FORMULARIO_BECA {get;set;} public int CORR_FORMULARIO_VERSION {get;set;} public string NOMBRE_FORMULARIO {get;set;}
  public string VERSION_FORMULARIO {get;set;} public DateTime FECHA_INICIO {get;set;} public DateTime? FECHA_FIN {get;set;}
  public string ESTADO_VERSION {get;set;} public bool ACTIVO {get;set;} public int CANT_SECCIONES {get;set;} public int CANT_PREGUNTAS {get;set;}
  public int CANT_SOLICITUDES {get;set;} public byte[] VERSION_REGISTRO {get;set;}
 }
 public sealed class BecaAsignacionFila {
  public int CORR_TIPO_FORMULARIO {get;set;} public int CORR_BECA {get;set;} public int CORR_FORMULARIO_VERSION {get;set;}
  public int CORR_FORMULARIO_BECA {get;set;} public string NOMBRE_FORMULARIO {get;set;} public string VERSION_FORMULARIO {get;set;}
  public string ESTADO_VERSION {get;set;} public DateTime FECHA_INICIO {get;set;} public DateTime? FECHA_FIN {get;set;}
  public short? ANIO_ADMISION {get;set;} public byte? NUMERO_PERIODO_ADMISION {get;set;} public bool ACTIVO {get;set;} public byte[] VERSION_REGISTRO {get;set;}
 }
 public sealed class BecaPlantillaFila { public int CORR_FORMULARIO_VERSION {get;set;} public int CORR_BECA {get;set;} public string NOMBRE_BECA {get;set;} }
 public sealed class BecaCicloFila { public int CORR_PERIODO_ACADEMICO {get;set;} public short ANIO {get;set;} public byte NUMERO_PERIODO {get;set;} public bool ACTIVO {get;set;} }
}
