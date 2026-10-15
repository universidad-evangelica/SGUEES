using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using sguees.api.Shared;
using sguees.Models;
using sguees.Repositories;
using sguees.Services;

namespace sguees.Models
{
    public class ACA_PERIODOInput
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_FACULTAD { get; set; }
        public int? CORR_CARRERA { get; set; }
        public int ANIO { get; set; }
        public int? NUMERO_PERIODO { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public DateTime? FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime? FECHA_FIN_INSCRIPCION { get; set; }
    }
    public class ACA_PERIODOConsulta
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int ANIO { get; set; }
        public int NUMERO_PERIODO { get; set; }
        public DateTime? FECHA_REFERENCIA { get; set; }
    }
    public class ACA_PERIODOView : ACA_PERIODOS_ACADEMICOSTable
    {
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string NOMBRE_AREA { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string ALCANCE { get; set; }
        public bool EN_USO { get; set; }
    }
    public class ACA_PERIODOHistorial : ACA_PERIODOView
    {
        public long ID_BITACORA { get; set; }
        public string TIPO_CAMBIO { get; set; }
        public string USUARIO_CAMBIO { get; set; }
        public DateTime FECHA_CAMBIO { get; set; }
    }
    public class ACA_PERIODOCatalogo
    {
        public string TIPO { get; set; }
        public int Key { get; set; }
        public string Value { get; set; }
        public bool ACTIVO { get; set; }
        public int? CORR_SEDE { get; set; }
        public int? CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_FACULTAD { get; set; }
    }
    public class ACA_PERIODOOferta
    {
        public int CORR_CARRERA { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public short ANIO_PLAN { get; set; }
        public int CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime FECHA_FIN { get; set; }
        public DateTime FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime FECHA_FIN_INSCRIPCION { get; set; }
    }
}
namespace sguees.Repositories
{
    public interface IACA_PERIODOS_MANTENIMIENTORepository
    {
        Task<CResult> GetAllAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetCatalogosAsync(int empresa);
        Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data);
        Task<CResult> WriteAsync(int operation,ACA_PERIODOInput data,string user,string station);
    }
    public class ACA_PERIODOS_MANTENIMIENTORepository : IACA_PERIODOS_MANTENIMIENTORepository
    {
        private readonly string connection;
        public ACA_PERIODOS_MANTENIMIENTORepository(IConfiguration config){connection=config.GetConnectionString("defaultConnection");}
        private static SqlParameter P(string name,SqlDbType type,object value)=>new(name,type){Value=value??DBNull.Value};
        private static CResult Error(string message)=>new(){ErrorCode=51000,ErrorMessage=message};
        private async Task<CResult> Read<T>(string sql,params SqlParameter[] parameters) where T:new()
        {
            try
            {
                using var c=new SqlConnection(connection);await c.OpenAsync();
                using var cmd=new SqlCommand(sql,c);cmd.Parameters.AddRange(parameters);
                using var reader=await cmd.ExecuteReaderAsync();
                var rows=new List<T>().FromDataReader(reader).ToList();
                return new CResult{Result=true,Data=rows,RowsAffected=rows.Count};
            }
            catch(Exception ex){return Error(ex.Message);}
        }
        public Task<CResult> GetAllAsync(ACA_PERIODOConsulta data)
            =>data.CORR_EMPRESA<=0?Task.FromResult(Error("No se encontró la empresa de la sesión.")):
            Read<ACA_PERIODOView>("SELECT * FROM dbo.V_ACA_PERIODOS_MTTO WHERE CORR_EMPRESA=@empresa AND (@id=0 OR CORR_PERIODO_ACADEMICO=@id) ORDER BY ANIO DESC,NUMERO_PERIODO DESC,CORR_PERIODO_ACADEMICO",
                P("@empresa",SqlDbType.Int,data.CORR_EMPRESA),P("@id",SqlDbType.Int,data.CORR_PERIODO_ACADEMICO));
        public Task<CResult> GetCatalogosAsync(int empresa)
            =>empresa<=0?Task.FromResult(Error("No se encontró la empresa de la sesión.")):
            Read<ACA_PERIODOCatalogo>("SELECT * FROM dbo.V_ACA_PERIODOS_CATALOGOS WHERE CORR_EMPRESA=@empresa ORDER BY TIPO,Value",P("@empresa",SqlDbType.Int,empresa));
        public Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data)
            =>data.CORR_EMPRESA<=0||data.CORR_PERIODO_ACADEMICO<=0?Task.FromResult(Error("Seleccione un período guardado.")):
            Read<ACA_PERIODOHistorial>("SELECT * FROM dbo.V_ACA_PERIODOS_HISTORIAL WHERE CORR_EMPRESA=@empresa AND CORR_PERIODO_ACADEMICO=@id ORDER BY ID_BITACORA DESC",
                P("@empresa",SqlDbType.Int,data.CORR_EMPRESA),P("@id",SqlDbType.Int,data.CORR_PERIODO_ACADEMICO));
        public Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data)
        {
            if(data.CORR_EMPRESA<=0||data.CORR_SEDE<=0||data.CORR_AREA_ACADEMICA<=0||data.ANIO<1||data.ANIO>9999||data.NUMERO_PERIODO<1||data.NUMERO_PERIODO>255||!data.FECHA_REFERENCIA.HasValue)
                return Task.FromResult(Error("Seleccione sede, área, año, número y fecha de referencia para consultar V2."));
            // Empresa y padres se verifican también dentro de V2. Solo consulta: no migra consumidores.
            return Read<ACA_PERIODOOferta>("SELECT * FROM dbo.FN_ACA_OFERTA_CICLO_V2(@empresa,@sede,@area,@anio,@numero,@fecha) ORDER BY NOMBRE_CARRERA,NOMBRE_MODALIDAD",
                P("@empresa",SqlDbType.Int,data.CORR_EMPRESA),P("@sede",SqlDbType.Int,data.CORR_SEDE),P("@area",SqlDbType.Int,data.CORR_AREA_ACADEMICA),
                P("@anio",SqlDbType.SmallInt,data.ANIO),P("@numero",SqlDbType.TinyInt,data.NUMERO_PERIODO),P("@fecha",SqlDbType.Date,data.FECHA_REFERENCIA.Value.Date));
        }
        public async Task<CResult> WriteAsync(int operation,ACA_PERIODOInput data,string user,string station)
        {
            try
            {
                int id;
                using(var c=new SqlConnection(connection))
                {
                    await c.OpenAsync();using var cmd=new SqlCommand("dbo.PRAL_MTTO_ACA_PERIODOS",c){CommandType=CommandType.StoredProcedure};
                    cmd.Parameters.AddRange(new[]{P("@TIPO_ACTUALIZA",SqlDbType.Int,operation),P("@CORR_EMPRESA",SqlDbType.Int,data.CORR_EMPRESA),
                        P("@CORR_PERIODO_ACADEMICO",SqlDbType.Int,operation==1?0:data.CORR_PERIODO_ACADEMICO),
                        P("@CORR_SEDE",SqlDbType.Int,data.CORR_SEDE),P("@CORR_AREA_ACADEMICA",SqlDbType.Int,data.CORR_AREA_ACADEMICA),
                        P("@CORR_FACULTAD",SqlDbType.Int,data.CORR_FACULTAD),P("@CORR_CARRERA",SqlDbType.Int,data.CORR_CARRERA),
                        P("@ANIO",SqlDbType.Int,data.ANIO),P("@NUMERO_PERIODO",SqlDbType.Int,data.NUMERO_PERIODO),
                        P("@FECHA_INICIO",SqlDbType.Date,data.FECHA_INICIO?.Date),P("@FECHA_FIN",SqlDbType.Date,data.FECHA_FIN?.Date),
                        P("@FECHA_INICIO_INSCRIPCION",SqlDbType.Date,data.FECHA_INICIO_INSCRIPCION?.Date),P("@FECHA_FIN_INSCRIPCION",SqlDbType.Date,data.FECHA_FIN_INSCRIPCION?.Date),
                        P("@SYS_LOGIN_USUARIO",SqlDbType.VarChar,user),P("@SYS_ESTACION",SqlDbType.VarChar,station??""),
                        P("@SYS_NUMERO_ERROR",SqlDbType.Int,0),P("@SYS_MENSAJE_ERROR",SqlDbType.NVarChar,""),P("@SYS_FILAS_AFECTADAS",SqlDbType.Int,0)});
                    cmd.Parameters["@CORR_PERIODO_ACADEMICO"].Direction=ParameterDirection.InputOutput;
                    foreach(var name in new[]{"@SYS_NUMERO_ERROR","@SYS_MENSAJE_ERROR","@SYS_FILAS_AFECTADAS"})cmd.Parameters[name].Direction=ParameterDirection.InputOutput;
                    cmd.Parameters["@SYS_MENSAJE_ERROR"].Size=4000;
                    await cmd.ExecuteNonQueryAsync();
                    var code=Convert.ToInt32(cmd.Parameters["@SYS_NUMERO_ERROR"].Value);
                    if(code!=0)return new CResult{ErrorCode=code,ErrorMessage=Convert.ToString(cmd.Parameters["@SYS_MENSAJE_ERROR"].Value)};
                    id=Convert.ToInt32(cmd.Parameters["@CORR_PERIODO_ACADEMICO"].Value);
                }
                var read=await GetAllAsync(new(){CORR_EMPRESA=data.CORR_EMPRESA,CORR_PERIODO_ACADEMICO=id});
                if(!read.Result)return read;
                var row=((IEnumerable<ACA_PERIODOView>)read.Data).SingleOrDefault();
                return new CResult{Result=row!=null,Data=row,CodeHelper=id,RowsAffected=row==null?0:1,ErrorMessage=row==null?"No se encontró el período guardado.":""};
            }
            catch(Exception ex){return Error(ex.Message);}
        }
    }
}
namespace sguees.Services
{
    public interface IACA_PERIODOS_MANTENIMIENTOService
    {
        Task<CResult> GetAllAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetCatalogosAsync(int empresa);
        Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data);
        Task<CResult> WriteAsync(int operation,ACA_PERIODOInput data,string user,string station);
    }
    public class ACA_PERIODOS_MANTENIMIENTOService : IACA_PERIODOS_MANTENIMIENTOService
    {
        private readonly IACA_PERIODOS_MANTENIMIENTORepository repo;
        public ACA_PERIODOS_MANTENIMIENTOService(IACA_PERIODOS_MANTENIMIENTORepository repo){this.repo=repo;}
        public Task<CResult> GetAllAsync(ACA_PERIODOConsulta data)=>repo.GetAllAsync(data);
        public Task<CResult> GetCatalogosAsync(int empresa)=>repo.GetCatalogosAsync(empresa);
        public Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data)=>repo.GetHistorialAsync(data);
        public Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data)=>repo.GetOfertaAsync(data);
        public Task<CResult> WriteAsync(int operation,ACA_PERIODOInput data,string user,string station)
        {
            string error=null;
            if(data.CORR_EMPRESA<=0||(operation!=1&&data.CORR_PERIODO_ACADEMICO<=0))error="Seleccione la empresa y un período válido.";
            else if(operation!=3)
            {
                if(data.CORR_SEDE<=0||data.CORR_AREA_ACADEMICA<=0)error="Seleccione sede y área académica.";
                else if(data.ANIO<1||data.ANIO>9999||!data.NUMERO_PERIODO.HasValue||data.NUMERO_PERIODO<1||data.NUMERO_PERIODO>255)error="Ingrese un año entre 1 y 9999 y un número de período entre 1 y 255.";
                else if(!data.FECHA_INICIO.HasValue||!data.FECHA_FIN.HasValue||!data.FECHA_INICIO_INSCRIPCION.HasValue||!data.FECHA_FIN_INSCRIPCION.HasValue)error="Las cuatro fechas son obligatorias.";
                else if(data.FECHA_FIN.Value.Date<data.FECHA_INICIO.Value.Date)error="El fin académico no puede ser anterior al inicio.";
                else if(data.FECHA_FIN_INSCRIPCION.Value.Date<data.FECHA_INICIO_INSCRIPCION.Value.Date)error="El cierre de inscripción no puede ser anterior a su apertura.";
                else if(data.FECHA_FIN_INSCRIPCION.Value.Date>data.FECHA_FIN.Value.Date)error="El cierre de inscripción no puede ser posterior al fin académico.";
            }
            return error!=null?Task.FromResult(new CResult{ErrorCode=51000,ErrorMessage=error}):repo.WriteAsync(operation,data,user,station);
        }
    }
}
namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_PERIODOS_MANTENIMIENTOController : ControllerBase
    {
        private readonly IACA_PERIODOS_MANTENIMIENTOService service;
        public ACA_PERIODOS_MANTENIMIENTOController(IACA_PERIODOS_MANTENIMIENTOService service){this.service=service;}
        private int Empresa=>int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id)?id:0;
        [HttpGet("GetAll"),Authorize(Policy="/aca-periodos-academicos|R")]
        public Task<CResult> GetAll([FromQuery]ACA_PERIODOConsulta data){data.CORR_EMPRESA=Empresa;return service.GetAllAsync(data);}
        [HttpGet("GetCatalogos"),Authorize(Policy="/aca-periodos-academicos|R")]
        public Task<CResult> GetCatalogos()=>service.GetCatalogosAsync(Empresa);
        [HttpGet("GetHistorial"),Authorize(Policy="/aca-periodos-academicos|R")]
        public Task<CResult> GetHistorial([FromQuery]ACA_PERIODOConsulta data){data.CORR_EMPRESA=Empresa;return service.GetHistorialAsync(data);}
        [HttpGet("GetOferta"),Authorize(Policy="/aca-periodos-academicos|R")]
        public Task<CResult> GetOferta([FromQuery]ACA_PERIODOConsulta data){data.CORR_EMPRESA=Empresa;return service.GetOfertaAsync(data);}
        [HttpPost,Authorize(Policy="/aca-periodos-academicos|C")]
        public async Task<IActionResult> Post(ACA_PERIODOInput data){data.CORR_EMPRESA=Empresa;var r=await service.WriteAsync(1,data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));return r.Result?StatusCode(201,r):BadRequest(r);}
        [HttpPut,Authorize(Policy="/aca-periodos-academicos|U")]
        public async Task<IActionResult> Put(ACA_PERIODOInput data){this.ApplyQueryKeys(data,nameof(data.CORR_PERIODO_ACADEMICO));data.CORR_EMPRESA=Empresa;var r=await service.WriteAsync(2,data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));return r.Result?Ok(r):BadRequest(r);}
        [HttpPut("ActivarInactivar"),Authorize(Policy="/aca-periodos-academicos|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_PERIODOInput data){this.ApplyQueryKeys(data,nameof(data.CORR_PERIODO_ACADEMICO));data.CORR_EMPRESA=Empresa;var r=await service.WriteAsync(3,data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));return r.Result?Ok(r):BadRequest(r);}
    }
}
