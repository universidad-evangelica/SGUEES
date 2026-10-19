using System;
using System.Collections.Generic;
using System.Data;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using sguees.api.Shared;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Models
{
    public class ACA_CICLOInput
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int ANIO { get; set; }
        public int NUMERO_PERIODO { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public DateTime? FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime? FECHA_FIN_INSCRIPCION { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_CARRERA { get; set; }
        public bool ACTIVO { get; set; }=true;
    }
}
namespace sguees.Repositories
{
    public interface IACA_CICLOSRepository
    {
        Task<CResult> Areas(int empresa);
        Task<CResult> Listar(int empresa,int area);
        Task<CResult> Detalle(int empresa,int id);
        Task<CResult> Catalogos(int empresa);
        Task<CResult> Oferta(int empresa,int id,int sede,DateTime fecha);
        Task<CResult> Write(string operation,int empresa,ACA_CICLOInput input,string user,string station);
    }
    public class ACA_CICLOSRepository : IACA_CICLOSRepository
    {
        private readonly string connection;
        public ACA_CICLOSRepository(IConfiguration config){connection=config.GetConnectionString("defaultConnection");}
        private static SqlParameter P(string name,SqlDbType type,object value)=>new(name,type){Value=value??DBNull.Value};
        private static CResult Error(string message)=>new(){ErrorCode=51000,ErrorMessage=message};
        private async Task<List<Dictionary<string,object>>> Rows(string sql,params SqlParameter[] parameters)
        {
            using var c=new SqlConnection(connection);await c.OpenAsync();
            using var cmd=new SqlCommand(sql,c);cmd.Parameters.AddRange(parameters);
            using var reader=await cmd.ExecuteReaderAsync();var rows=new List<Dictionary<string,object>>();
            while(await reader.ReadAsync()){var row=new Dictionary<string,object>();for(int i=0;i<reader.FieldCount;i++)row[reader.GetName(i)]=reader.IsDBNull(i)?null:reader.GetValue(i);rows.Add(row);}return rows;
        }
        private async Task<CResult> Read(string sql,params SqlParameter[] parameters)
        {
            try{var rows=await Rows(sql,parameters);return new(){Result=true,Data=rows,RowsAffected=rows.Count};}catch(Exception ex){return Error(ex.Message);}
        }
        public Task<CResult> Areas(int empresa)=>Read(@"SELECT A.CORR_AREA_ACADEMICA,A.NOMBRE_AREA,A.ACTIVO,
          (SELECT COUNT(*) FROM dbo.ACA_CICLOS_ACADEMICOS C WHERE C.CORR_EMPRESA=A.CORR_EMPRESA AND C.CORR_AREA_ACADEMICA=A.CORR_AREA_ACADEMICA) AS CICLOS_DEFINIDOS,
          (SELECT COUNT(*) FROM dbo.ACA_CICLOS_ACADEMICOS C WHERE C.CORR_EMPRESA=A.CORR_EMPRESA AND C.CORR_AREA_ACADEMICA=A.CORR_AREA_ACADEMICA AND C.ESTADO='HABILITADO') AS CICLOS_HABILITADOS
          FROM dbo.ACA_AREAS_ACADEMICAS A WHERE A.CORR_EMPRESA=@empresa ORDER BY A.NOMBRE_AREA",P("@empresa",SqlDbType.Int,empresa));
        public Task<CResult> Listar(int empresa,int area)=>Read("SELECT * FROM dbo.V_ACA_CICLOS WHERE CORR_EMPRESA=@empresa AND (@area=0 OR CORR_AREA_ACADEMICA=@area) ORDER BY ANIO DESC,NUMERO_PERIODO DESC",P("@empresa",SqlDbType.Int,empresa),P("@area",SqlDbType.Int,area));
        public Task<CResult> Catalogos(int empresa)=>Read("SELECT * FROM dbo.V_ACA_PERIODOS_CATALOGOS WHERE CORR_EMPRESA=@empresa ORDER BY TIPO,Value",P("@empresa",SqlDbType.Int,empresa));
        public async Task<CResult> Detalle(int empresa,int id)
        {
            try
            {
                var header=await Rows("SELECT * FROM dbo.V_ACA_CICLOS WHERE CORR_EMPRESA=@empresa AND CORR_CICLO_ACADEMICO=@id",P("@empresa",SqlDbType.Int,empresa),P("@id",SqlDbType.Int,id));
                if(header.Count!=1)return Error("El ciclo no existe en la empresa de la sesión.");
                async Task<List<Dictionary<string,object>>> Get(string sql)=>await Rows(sql,P("@id",SqlDbType.Int,id),P("@empresa",SqlDbType.Int,empresa));
                var sedes=await Get("SELECT S.*,G.NOMBRE_SEDE FROM dbo.ACA_CICLOS_SEDES S JOIN dbo.GEN_SEDES G ON G.CORR_SEDE=S.CORR_SEDE WHERE S.CORR_CICLO_ACADEMICO=@id AND G.CORR_EMPRESA=@empresa ORDER BY G.NOMBRE_SEDE");
                var facultades=await Get("SELECT F.*,G.NOMBRE_FACULTAD FROM dbo.ACA_CICLOS_FACULTADES_SEDES F JOIN dbo.ACA_FACULTADES G ON G.CORR_FACULTAD=F.CORR_FACULTAD WHERE F.CORR_CICLO_ACADEMICO=@id AND G.CORR_EMPRESA=@empresa ORDER BY G.NOMBRE_FACULTAD");
                var carreras=await Get("SELECT * FROM dbo.V_ACA_CICLOS_RESUMEN WHERE CORR_CICLO_ACADEMICO=@id AND CORR_EMPRESA=@empresa ORDER BY NOMBRE_SEDE,NOMBRE_FACULTAD,NOMBRE_CARRERA");
                var historial=await Get("SELECT B.ID_BITACORA,B.OPERACION,B.USUARIO,B.ESTACION,B.FECHA FROM dbo.ACA_CICLOS_BITACORA B JOIN dbo.ACA_CICLOS_ACADEMICOS C ON C.CORR_CICLO_ACADEMICO=B.CORR_CICLO_ACADEMICO WHERE C.CORR_CICLO_ACADEMICO=@id AND C.CORR_EMPRESA=@empresa ORDER BY B.ID_BITACORA DESC");
                var origen=await Get(@"SELECT P.CORR_PERIODO_ACADEMICO,P.CORR_SEDE,S.NOMBRE_SEDE,
                  P.CORR_FACULTAD,F.NOMBRE_FACULTAD,P.CORR_CARRERA,R.NOMBRE_CARRERA,
                  P.FECHA_INICIO,P.FECHA_FIN,P.FECHA_INICIO_INSCRIPCION,P.FECHA_FIN_INSCRIPCION,P.ACTIVO,P.ES_GESTIONADO_CICLO
                  FROM dbo.ACA_PERIODOS_ACADEMICOS P
                  JOIN dbo.ACA_CICLOS_ACADEMICOS C ON C.CORR_CICLO_ACADEMICO=P.CORR_CICLO_ACADEMICO
                  LEFT JOIN dbo.GEN_SEDES S ON S.CORR_SEDE=P.CORR_SEDE AND S.CORR_EMPRESA=C.CORR_EMPRESA
                  LEFT JOIN dbo.ACA_FACULTADES F ON F.CORR_FACULTAD=P.CORR_FACULTAD AND F.CORR_EMPRESA=C.CORR_EMPRESA
                  LEFT JOIN dbo.ACA_CARRERAS R ON R.CORR_CARRERA=P.CORR_CARRERA AND R.CORR_EMPRESA=C.CORR_EMPRESA
                  WHERE C.CORR_CICLO_ACADEMICO=@id AND C.CORR_EMPRESA=@empresa ORDER BY P.CORR_PERIODO_ACADEMICO");
                var planes=await Get(@"WITH Evaluados AS (
                  SELECT R.CORR_CARRERA,P.CORR_PLAN_ACADEMICO,P.CODIGO_PLAN,P.ANIO_PLAN,P.CORR_MODALIDAD,M.NOMBRE_MODALIDAD,
                    P.FECHA_VIGENCIA_INICIO,P.FECHA_VIGENCIA_FIN,
                    CASE WHEN P.CORR_PLAN_ACADEMICO IS NULL THEN N'Esta carrera no tiene planes académicos.'
                      WHEN ISNULL(P.PLAN_VIGENTE,0)=0 THEN N'El plan no está marcado como vigente.'
                      WHEN M.CORR_MODALIDAD IS NULL OR ISNULL(M.ACTIVO,0)=0 THEN N'La modalidad del plan no está activa en esta empresa.'
                      WHEN P.FECHA_VIGENCIA_INICIO IS NULL THEN N'El plan no tiene fecha de inicio de vigencia.'
                      WHEN P.FECHA_VIGENCIA_INICIO>H.FECHA_INICIO THEN N'El plan comienza el '+CONVERT(nvarchar(10),P.FECHA_VIGENCIA_INICIO,103)+N', después del inicio del ciclo ('+CONVERT(nvarchar(10),H.FECHA_INICIO,103)+N').'
                      WHEN P.FECHA_VIGENCIA_FIN<H.FECHA_INICIO THEN N'El plan terminó el '+CONVERT(nvarchar(10),P.FECHA_VIGENCIA_FIN,103)+N', antes del inicio del ciclo ('+CONVERT(nvarchar(10),H.FECHA_INICIO,103)+N').'
                      ELSE NULL END AS MOTIVO_PLAN
                  FROM dbo.ACA_CICLOS_ACADEMICOS H
                  JOIN dbo.ACA_CARRERAS R ON R.CORR_EMPRESA=H.CORR_EMPRESA AND (R.CORR_AREA_ACADEMICA=H.CORR_AREA_ACADEMICA
                    OR EXISTS(SELECT 1 FROM dbo.ACA_CICLOS_CARRERAS_SEDES X WHERE X.CORR_CICLO_ACADEMICO=H.CORR_CICLO_ACADEMICO AND X.CORR_CARRERA=R.CORR_CARRERA))
                  LEFT JOIN dbo.ACA_PLANES_ACADEMICOS P ON P.CORR_CARRERA=R.CORR_CARRERA
                  LEFT JOIN dbo.ACA_MODALIDADES_ACADEMICAS M ON M.CORR_MODALIDAD=P.CORR_MODALIDAD AND M.CORR_EMPRESA=H.CORR_EMPRESA
                  WHERE H.CORR_CICLO_ACADEMICO=@id AND H.CORR_EMPRESA=@empresa
                ), Ordenados AS (
                  SELECT *,ROW_NUMBER() OVER(PARTITION BY CORR_CARRERA,CORR_MODALIDAD ORDER BY CASE WHEN MOTIVO_PLAN IS NULL THEN 0 ELSE 1 END,ANIO_PLAN DESC,FECHA_VIGENCIA_INICIO DESC,CORR_PLAN_ACADEMICO DESC) AS RN FROM Evaluados
                ) SELECT *,CAST(CASE WHEN MOTIVO_PLAN IS NULL THEN 1 ELSE 0 END AS bit) AS ES_ELEGIBLE,
                    CAST(CASE WHEN MOTIVO_PLAN IS NULL AND RN=1 THEN 1 ELSE 0 END AS bit) AS ES_APLICABLE
                  FROM Ordenados ORDER BY CORR_CARRERA,CORR_MODALIDAD,RN");
                return new(){Result=true,Data=new{Cabecera=header[0],Sedes=sedes,Facultades=facultades,Carreras=carreras,Historial=historial,Periodos=origen,Planes=planes}};
            }
            catch(Exception ex){return Error(ex.Message);}
        }
        public Task<CResult> Oferta(int empresa,int id,int sede,DateTime fecha)=>Read(@"SELECT O.* FROM dbo.ACA_CICLOS_ACADEMICOS H
          CROSS APPLY dbo.FN_ACA_OFERTA_CICLO_V3(H.CORR_EMPRESA,@sede,H.CORR_AREA_ACADEMICA,H.ANIO,H.NUMERO_PERIODO,@fecha) O
          WHERE H.CORR_CICLO_ACADEMICO=@id AND H.CORR_EMPRESA=@empresa ORDER BY O.NOMBRE_CARRERA,O.NOMBRE_MODALIDAD",
          P("@empresa",SqlDbType.Int,empresa),P("@id",SqlDbType.Int,id),P("@sede",SqlDbType.Int,sede),P("@fecha",SqlDbType.Date,fecha.Date));
        public async Task<CResult> Write(string operation,int empresa,ACA_CICLOInput input,string user,string station)
        {
            if(empresa<=0||string.IsNullOrWhiteSpace(user))return Error("No se encontró empresa o usuario de la sesión.");
            try
            {
                int id;
                using(var c=new SqlConnection(connection))
                {
                    await c.OpenAsync();using var cmd=new SqlCommand("dbo.PRAL_MTTO_ACA_CICLOS",c){CommandType=CommandType.StoredProcedure};
                    cmd.Parameters.AddRange(new[]{P("@OPERACION",SqlDbType.VarChar,operation),P("@CORR_EMPRESA",SqlDbType.Int,empresa),P("@CORR_CICLO_ACADEMICO",SqlDbType.Int,input.CORR_CICLO_ACADEMICO),
                     P("@CORR_AREA_ACADEMICA",SqlDbType.Int,input.CORR_AREA_ACADEMICA),P("@ANIO",SqlDbType.Int,input.ANIO),P("@NUMERO_PERIODO",SqlDbType.Int,input.NUMERO_PERIODO),
                     P("@FECHA_INICIO",SqlDbType.Date,input.FECHA_INICIO?.Date),P("@FECHA_FIN",SqlDbType.Date,input.FECHA_FIN?.Date),P("@FECHA_INICIO_INSCRIPCION",SqlDbType.Date,input.FECHA_INICIO_INSCRIPCION?.Date),P("@FECHA_FIN_INSCRIPCION",SqlDbType.Date,input.FECHA_FIN_INSCRIPCION?.Date),
                     P("@CORR_SEDE",SqlDbType.Int,input.CORR_SEDE),P("@CORR_FACULTAD",SqlDbType.Int,input.CORR_FACULTAD),P("@CORR_CARRERA",SqlDbType.Int,input.CORR_CARRERA),P("@ACTIVO",SqlDbType.Bit,input.ACTIVO),
                     P("@SYS_LOGIN_USUARIO",SqlDbType.VarChar,user),P("@SYS_ESTACION",SqlDbType.VarChar,station),P("@SYS_NUMERO_ERROR",SqlDbType.Int,0),P("@SYS_MENSAJE_ERROR",SqlDbType.NVarChar,"")});
                    foreach(var name in new[]{"@CORR_CICLO_ACADEMICO","@SYS_NUMERO_ERROR","@SYS_MENSAJE_ERROR"})cmd.Parameters[name].Direction=ParameterDirection.InputOutput;
                    cmd.Parameters["@SYS_MENSAJE_ERROR"].Size=4000;await cmd.ExecuteNonQueryAsync();
                    var error=Convert.ToInt32(cmd.Parameters["@SYS_NUMERO_ERROR"].Value);if(error!=0)return new(){ErrorCode=error,ErrorMessage=Convert.ToString(cmd.Parameters["@SYS_MENSAJE_ERROR"].Value)};
                    id=Convert.ToInt32(cmd.Parameters["@CORR_CICLO_ACADEMICO"].Value);
                }
                return await Detalle(empresa,id);
            }
            catch(Exception ex){return Error(ex.Message);}
        }
    }
}
namespace sguees.Controllers
{
    [ApiController,Authorize,Route("[controller]")]
    public class ACA_CICLOSController : ControllerBase
    {
        private readonly IACA_CICLOSRepository repo;
        public ACA_CICLOSController(IACA_CICLOSRepository repo){this.repo=repo;}
        private int Empresa=>int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id)?id:0;
        [HttpGet("Areas"),Authorize(Policy="/aca-periodos-academicos|R")] public Task<CResult> Areas()=>repo.Areas(Empresa);
        [HttpGet("GetAll"),Authorize(Policy="/aca-periodos-academicos|R")] public Task<CResult> GetAll(int CORR_AREA_ACADEMICA=0)=>repo.Listar(Empresa,CORR_AREA_ACADEMICA);
        [HttpGet("Detalle"),Authorize(Policy="/aca-periodos-academicos|R")] public Task<CResult> Detalle(int CORR_CICLO_ACADEMICO)=>repo.Detalle(Empresa,CORR_CICLO_ACADEMICO);
        [HttpGet("Catalogos"),Authorize(Policy="/aca-periodos-academicos|R")] public Task<CResult> Catalogos()=>repo.Catalogos(Empresa);
        [HttpGet("Oferta"),Authorize(Policy="/aca-periodos-academicos|R")] public Task<CResult> Oferta(int CORR_CICLO_ACADEMICO,int CORR_SEDE,DateTime FECHA_REFERENCIA)=>repo.Oferta(Empresa,CORR_CICLO_ACADEMICO,CORR_SEDE,FECHA_REFERENCIA);
        private async Task<IActionResult> Write(string op,ACA_CICLOInput data){var r=await repo.Write(op,Empresa,data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));return r.Result?Ok(r):BadRequest(r);}
        [HttpPost,Authorize(Policy="/aca-periodos-academicos|C")] public Task<IActionResult> Post(ACA_CICLOInput data)=>Write("CREAR",data);
        [HttpPut,Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Put(ACA_CICLOInput data)=>Write("GUARDAR",data);
        [HttpPut("Sede"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Sede(ACA_CICLOInput data)=>Write("SEDE",data);
        [HttpPut("Facultad"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Facultad(ACA_CICLOInput data)=>Write("FACULTAD",data);
        [HttpPut("Carrera"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Carrera(ACA_CICLOInput data)=>Write("CARRERA",data);
        [HttpPut("Todas"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Todas(ACA_CICLOInput data)=>Write("TODAS",data);
        [HttpPut("Habilitar"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Habilitar(ACA_CICLOInput data)=>Write("HABILITAR",data);
        [HttpPut("Borrador"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Borrador(ACA_CICLOInput data)=>Write("BORRADOR",data);
        [HttpPut("Cerrar"),Authorize(Policy="/aca-periodos-academicos|U")] public Task<IActionResult> Cerrar(ACA_CICLOInput data)=>Write("CERRAR",data);
    }
}
