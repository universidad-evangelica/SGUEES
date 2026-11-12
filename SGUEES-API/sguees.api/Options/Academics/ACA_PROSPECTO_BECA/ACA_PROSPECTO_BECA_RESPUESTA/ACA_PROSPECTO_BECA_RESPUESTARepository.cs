using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: lectura del cuestionario de la solicitud de beca.
    // Lecturas por vistas y correcciones por procedimiento transaccional del framework.
    public class ACA_PROSPECTO_BECA_RESPUESTARepository : BaseRepository<ACA_PROSPECTO_BECA_RESPUESTATable>, IACA_PROSPECTO_BECA_RESPUESTARepository
    {
        private const string _ViewName = "V_ACA_PROSPECTO_BECA_RESPUESTA";

        public ACA_PROSPECTO_BECA_RESPUESTARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return GetRespuestasAsync(xWhere);
        }
        public async Task<CResult> GetOpcionesAsync(List<CParameter> parameters)
        {
            try
            {
                using var reader = await objData.GetDataReader("V_ACA_PROSPECTO_BECA_OPCION_EDICION", parameters, "ORDEN,CORR_OPCION_BECA");
                var data = new List<ACA_PROSPECTO_BECA_OPCIONView>().FromDataReader(reader).ToList();
                return new CResult { Result=true,Data=data,RowsAffected=data.Count };
            }
            catch (Exception ex) { return new CResult { ErrorCode=-1,ErrorMessage=ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
        public async Task<CResult> GuardarRespuestaAsync(List<CParameter> parameters)
        {
            try
            {
                using var reader = await objData.GetDataReader(CommandType.StoredProcedure,"PRAL_MTTO_ACA_PROSPECTO_BECA_RESPUESTA",parameters);
                var data = new List<ACA_PROSPECTO_BECA_TOTALESView>().FromDataReader(reader).SingleOrDefault();
                return new CResult { Result=data!=null,Data=data,RowsAffected=data==null?0:1,ErrorMessage=data==null?"No se obtuvo el resultado de la correccion.":"Respuesta actualizada" };
            }
            catch (Exception ex) { return new CResult { ErrorCode=-1,ErrorMessage=ex.Message }; }
            finally { objData.objConnection.Close(); }
        }

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> GetRespuestasAsync(List<CParameter> xWhere)
        {
            return LeerAsync(xWhere);
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_BECA_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_BECA_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_BECA_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private async Task<CResult> LeerAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ORDEN_SECCION, ORDEN_PREGUNTA, CORR_RESPUESTA_BECA");
                var response = new List<ACA_PROSPECTO_BECA_RESPUESTAView>().FromDataReader(reader).ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                ErrorCode = -1,
                ErrorMessage = "Operación no habilitada: ACA_PROSPECTO_BECA_RESPUESTA lee la vista y guarda por el servicio.",
            };
        }
    }
}
