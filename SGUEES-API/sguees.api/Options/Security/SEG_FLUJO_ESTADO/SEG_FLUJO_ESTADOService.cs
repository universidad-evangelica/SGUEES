using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using sguees.Services; // ← Agregar para usar ISEG_FLUJO_TIPO_DOCUMENTOService

namespace sguees.Services
{
    public class SEG_FLUJO_ESTADOService : ISEG_FLUJO_ESTADOService
    {
        private readonly ISEG_FLUJO_ESTADORepository _repo;
        private readonly ISEG_FLUJO_TIPO_DOCUMENTOService _tipoDocumentoService; // ← Nuevo servicio

        public SEG_FLUJO_ESTADOService(
            ISEG_FLUJO_ESTADORepository repo,
            ISEG_FLUJO_TIPO_DOCUMENTOService tipoDocumentoService) // ← Inyectar dependencia
        {
            _repo = repo;
            _tipoDocumentoService = tipoDocumentoService;
        }

        public async Task<CResult> GetAllAsync(SEG_FLUJO_ESTADOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_ESTADO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_ESTADO",Value=xWhere.CORR_ESTADO,DbType=System.Data.DbType.Int32});
            }

            if (xWhere.CORR_TIPO_DOCUMENTO != 0)
            {
                p.Add(new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=xWhere.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32});
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_ESTADO))
            {
                p.Add(new CParameter() {ParameterName="NOMBRE_ESTADO",Value=xWhere.NOMBRE_ESTADO,DbType=System.Data.DbType.String});
            }

           

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SEG_FLUJO_ESTADOParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_ESTADO",Value=xWhere.CORR_ESTADO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ESTADO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del estado es obligatorio" };

            if (Data.NOMBRE_ESTADO.Length > 50)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del estado no puede exceder los 50 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 255)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 255 caracteres" };

            // ✅ Validar que exista el tipo de documento usando el servicio de TipoDocumento
            var tipoDocumentoParam = new SEG_FLUJO_TIPO_DOCUMENTOParam
            {
                CORR_EMPRESA = Data.CORR_EMPRESA,
                CORR_TIPO_DOCUMENTO = Data.CORR_TIPO_DOCUMENTO
            };

            var resultadoTipo = await _tipoDocumentoService.GetAsync(tipoDocumentoParam);
            
            // Si no existe o hubo error
            if (!resultadoTipo.Result || resultadoTipo.Data == null)
            {
                return new CResult() 
                { 
                    Data = null, 
                    Result = false, 
                    ErrorCode = -1, 
                    ErrorMessage = "El tipo de documento especificado no existe" 
                };
            }

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_ESTADO))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del estado es obligatorio" };

            if (Data.NOMBRE_ESTADO.Length > 50)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre del estado no puede exceder los 50 caracteres" };

            if (Data.DESCRIPCION != null && Data.DESCRIPCION.Length > 255)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La descripción no puede exceder los 255 caracteres" };

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> GetByTipoDocumentoAsync(int corrEmpresa, int corrTipoDocumento)
        {
            var param = new SEG_FLUJO_ESTADOParam
            {
                CORR_EMPRESA = corrEmpresa,
                CORR_TIPO_DOCUMENTO = corrTipoDocumento,
                
            };
            return await GetAllAsync(param);
        }
    }
}