namespace SGUEES.Models {
 public sealed class BecaCuestionarioListado {
  public int CORR_BECA {get;set;} public string CODIGO_BECA {get;set;} public string NOMBRE_BECA {get;set;}
  public int? CORR_FORMULARIO_BECA {get;set;} public int? CORR_FORMULARIO_VERSION {get;set;}
  public string NOMBRE_FORMULARIO {get;set;} public string VERSION_FORMULARIO {get;set;} public string ESTADO_VERSION {get;set;}
  public int CANT_PREGUNTAS {get;set;} public int CANT_ASIGNACIONES {get;set;}
 }
}
