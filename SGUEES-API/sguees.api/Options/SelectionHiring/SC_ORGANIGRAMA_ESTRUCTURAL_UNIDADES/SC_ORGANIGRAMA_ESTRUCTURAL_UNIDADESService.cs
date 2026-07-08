using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService : ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService
    {
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository _repo;
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELRepository _nivelRepo;

        public SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService(
            ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESRepository repo,
            ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELRepository nivelRepo)
        {
            _repo = repo;
            _nivelRepo = nivelRepo;
        }

        public async Task<CResult> GetAllAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            };

            if (xWhere.CORR_UNIDAD != 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_UNIDAD", Value = xWhere.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
            }

            if (!string.IsNullOrEmpty(xWhere.CODIGO_UNIDAD))
            {
                p.Add(new CParameter() { ParameterName = "CODIGO_UNIDAD", Value = xWhere.CODIGO_UNIDAD, DbType = System.Data.DbType.String });
            }

            if (!string.IsNullOrEmpty(xWhere.NOMBRE_UNIDAD))
            {
                p.Add(new CParameter() { ParameterName = "NOMBRE_UNIDAD", Value = xWhere.NOMBRE_UNIDAD, DbType = System.Data.DbType.String });
            }

            if (xWhere.CORR_NIVEL != 0)
            {
                p.Add(new CParameter() { ParameterName = "CORR_NIVEL", Value = xWhere.CORR_NIVEL, DbType = System.Data.DbType.Int32 });
            }

            return await _repo.GetAllAsync(p);
        }

        public async Task<CResult> GetAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam xWhere)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_UNIDAD",Value=xWhere.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        public async Task<CResult> CreateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            // Validaciones de negocio
            if (string.IsNullOrWhiteSpace(Data.NOMBRE_UNIDAD))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre de la unidad es obligatorio" };

            if (Data.NOMBRE_UNIDAD.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre de la unidad no puede exceder los 100 caracteres" };

            if (Data.CORR_NIVEL <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un nivel" };

            // Si el código está vacío o es "AUTO", generarlo automáticamente
            if (string.IsNullOrEmpty(Data.CODIGO_UNIDAD) || Data.CODIGO_UNIDAD.ToUpper() == "AUTO")
            {
                try
                {
                    Data.CODIGO_UNIDAD = await GenerarCodigoUnidad(Data);
                }
                catch (Exception ex)
                {
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = $"Error al generar el codigo: {ex.Message}" };
                }
            }
            else
            {
                if (Data.CODIGO_UNIDAD.Length > 10)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El codigo de la unidad no puede exceder los 10 caracteres" };
            }

            // Si tiene unidad padre, verificar que existe y es válida
            if (Data.CORR_UNIDAD_PADRE.HasValue && Data.CORR_UNIDAD_PADRE.Value > 0)
            {
                var padreParam = new SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam
                {
                    CORR_EMPRESA = Data.CORR_EMPRESA,
                    CORR_UNIDAD = Data.CORR_UNIDAD_PADRE.Value
                };
                var padreResult = await GetAsync(padreParam);
                if (!padreResult.Result || padreResult.Data == null)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La unidad padre seleccionada no existe" };

                var padre = (SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView)padreResult.Data;


                // Validar que el padre esté activo
                if (!padre.ACTIVO)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La unidad padre seleccionada no esta activa" };
            }

            Data.CORR_NIVEL = Data.CORR_NIVEL + 1; //LE SUMAREMOS 1 AL NIVEL porque enviamos el anterior osea el nivel hijo.
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (string.IsNullOrWhiteSpace(Data.CODIGO_UNIDAD))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El codigo de la unidad es obligatorio" };

            if (Data.CODIGO_UNIDAD.Length > 10)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El codigo de la unidad no puede exceder los 10 caracteres" };

            if (string.IsNullOrWhiteSpace(Data.NOMBRE_UNIDAD))
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre de la unidad es obligatorio" };

            if (Data.NOMBRE_UNIDAD.Length > 100)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "El nombre de la unidad no puede exceder los 100 caracteres" };

            if (Data.CORR_NIVEL <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un nivel" };

            if (Data.CORR_UNIDAD_PADRE.HasValue && Data.CORR_UNIDAD_PADRE.Value > 0)
            {
                if (Data.CORR_UNIDAD_PADRE.Value == Data.CORR_UNIDAD)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Una unidad no puede ser su propia unidad padre" };

                var padreParam = new SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam
                {
                    CORR_EMPRESA = Data.CORR_EMPRESA,
                    CORR_UNIDAD = Data.CORR_UNIDAD_PADRE.Value
                };
                var padreResult = await GetAsync(padreParam);
                if (!padreResult.Result || padreResult.Data == null)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La unidad padre seleccionada no existe" };

                var padre = (SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView)padreResult.Data;

                // Validar que el padre sea del nivel inmediato superior
                if (padre.CORR_NIVEL != Data.CORR_NIVEL - 1)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = $"La unidad padre debe ser del nivel {Data.CORR_NIVEL - 1} (inmediato superior)" };

                if (!padre.ACTIVO)
                    return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "La unidad padre seleccionada no esta activa" };
            }

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // ======================================================
        // FUNCIONES PARA GENERACION DE CODIGO
        // ======================================================

        private async Task<string> GenerarCodigoUnidad(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data)
        {
            // 1. Obtener el codigo del padre (si existe)
            string codigoPadre = "";
            if (Data.CORR_UNIDAD_PADRE.HasValue && Data.CORR_UNIDAD_PADRE.Value > 0)
            {
                var padreParam = new SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam
                {
                    CORR_EMPRESA = Data.CORR_EMPRESA,
                    CORR_UNIDAD = Data.CORR_UNIDAD_PADRE.Value
                };
                var padreResult = await GetAsync(padreParam);
                if (padreResult.Result && padreResult.Data != null)
                {
                    var padre = (SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView)padreResult.Data;
                    codigoPadre = padre.CODIGO_UNIDAD;
                }
            }

            // 2. Si es Nivel 1 (sin padre) → secuencial simple (1, 2, 3, 4...)
            if (string.IsNullOrEmpty(codigoPadre))
            {
                var maxCodigo = await ObtenerMaximoCodigoNivel1(Data.CORR_EMPRESA);
                return (maxCodigo + 1).ToString();
            }

            // 3. Para niveles con padre → secuencia de 2 digitos
            // Buscar el maximo codigo entre las unidades que comienzan con el codigo del padre
            var maxSecuencia = await ObtenerMaximoCodigoHijo(Data.CORR_EMPRESA, codigoPadre);
            int nuevaSecuencia = maxSecuencia + 1;
            string secuenciaStr = nuevaSecuencia.ToString().PadLeft(2, '0');
            return codigoPadre + secuenciaStr;
        }

        private async Task<int> ObtenerMaximoCodigoNivel1(int corrEmpresa)
        {
            var param = new SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam
            {
                CORR_EMPRESA = corrEmpresa,
                CORR_NIVEL = 1
            };
            var resultado = await GetAllAsync(param);
            if (!resultado.Result || resultado.Data == null)
                return 0;

            var unidades = (List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>)resultado.Data;
            int maxCodigo = 0;

            foreach (var u in unidades)
            {
                if (!string.IsNullOrEmpty(u.CODIGO_UNIDAD) && int.TryParse(u.CODIGO_UNIDAD, out int num))
                {
                    if (num > maxCodigo)
                        maxCodigo = num;
                }
            }
            return maxCodigo;
        }

        private async Task<int> ObtenerMaximoCodigoHijo(int corrEmpresa, string codigoPadre)
        {
            var param = new SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam
            {
                CORR_EMPRESA = corrEmpresa
            };
            var resultado = await GetAllAsync(param);
            if (!resultado.Result || resultado.Data == null)
                return 0;

            var unidades = (List<SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView>)resultado.Data;
            int maxSecuencia = 0;

            foreach (var u in unidades)
            {
                if (!string.IsNullOrEmpty(u.CODIGO_UNIDAD) && u.CODIGO_UNIDAD.StartsWith(codigoPadre))
                {
                    string resto = u.CODIGO_UNIDAD.Substring(codigoPadre.Length);
                    if (resto.Length == 2 && int.TryParse(resto, out int num))
                    {
                        if (num > maxSecuencia)
                            maxSecuencia = num;
                    }
                }
            }
            return maxSecuencia;
        }
    }
}