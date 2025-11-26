using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using scuees.api.Shared;
using Microsoft.AspNetCore.Mvc;

namespace scuees.Services
{
	public class SEG_USUARIOService: ISEG_USUARIOService
	{
		private readonly ISEG_USUARIORepository _repo;
		private readonly ISEG_USUARIO_OPCIONRepository _SEG_USUARIO_OPCIONRepository;
		private readonly IConfiguration _config;  
		
		public SEG_USUARIOService(ISEG_USUARIORepository repo,
									ISEG_USUARIO_OPCIONRepository SEG_USUARIO_OPCIONRepository,
									IConfiguration config	
								)
		{
			_repo = repo;
			_SEG_USUARIO_OPCIONRepository = SEG_USUARIO_OPCIONRepository;
			_config = config;
		}
		
		public async Task<CResult> GetAllAsync(SEG_USUARIOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="@TIPO_CONSULTA",Value=1,DbType=System.Data.DbType.Int32});
            p.Add(new CParameter() {ParameterName="@LOGIN_SISTEMA",Value=xWhere.LOGIN_SISTEMA,DbType=System.Data.DbType.String});
            p.Add(new CParameter() {ParameterName="@OPCION_CONSULTA",Value=0,DbType=System.Data.DbType.Int32});

			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			return await _repo.GetAsync(xWhere);
		}
		
		public async Task<CResult> CreateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		public async Task<CResult> LoginAsync(string LOGIN_SISTEMA, string CLAVE_USUARIO, string CODIGO_SUITE)
        {
            var objResultado = new CResult();

            try
            {
                // Autenticando en Class
                var pAuth = new List<CParameter>();
                pAuth.Add(new CParameter() {ParameterName="@USUARIO",Value=LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                pAuth.Add(new CParameter() {ParameterName="@CLAVE",Value=CLAVE_USUARIO,DbType=System.Data.DbType.String});

                var objResultaAuthClass = await _repo.GetAuthClassAsync(pAuth);

                if (objResultaAuthClass.Result  == false)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper =  0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Error de Autenticación en CLASS!";
                    objResultado.ErrorSource = "Login()";
                    return objResultado;
                }

                SEG_USUARIOView DataUsuario = new ();

                if ((int)objResultaAuthClass.Data  == 1) // Esta en CLASS
                {
                    var pWhere = new List<CParameter>();
                    pWhere.Add(new CParameter() {ParameterName="LOGIN_SISTEMA",Value=LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                    
                    var objResultadoUsuario = await _repo.GetUsuarioClassAsync(pWhere);
                    if (objResultadoUsuario.Result  == false){
                        objResultado.Data = null;
                        objResultado.Result = false;
                        objResultado.RowsAffected = 0;
                        objResultado.CodeHelper =  0;
                        objResultado.ErrorCode = -1;
                        objResultado.ErrorMessage = "Usuario o Clave Inválida!";
                        objResultado.ErrorSource = "Login()";
                        return objResultado;
                    }

                    DataUsuario = (SEG_USUARIOView)objResultadoUsuario.Data;

                } else { //Si no esta en CLASS se busca como usuario proveedor
                    var pWhere = new List<CParameter>();
                    pWhere.Add(new CParameter() {ParameterName="LOGIN_SISTEMA",Value=LOGIN_SISTEMA,DbType=System.Data.DbType.String});
                    
                    var objResultadoUsuario = await GetAsync(pWhere);

                    if (objResultadoUsuario.Result  == false){
                        objResultado.Data = null;
                        objResultado.Result = false;
                        objResultado.RowsAffected = 0;
                        objResultado.CodeHelper =  0;
                        objResultado.ErrorCode = -1;
                        objResultado.ErrorMessage = "Usuario o Clave Inválida!";
                        objResultado.ErrorSource = "Login()";
                        return objResultado;
                    }

                    if (objResultadoUsuario.Data  == null){
                        objResultado.Data = null;
                        objResultado.Result = false;
                        objResultado.RowsAffected = 0;
                        objResultado.CodeHelper =  0;
                        objResultado.ErrorCode = -1;
                        objResultado.ErrorMessage = "Usuario o Clave Inválida!";
                        objResultado.ErrorSource = "Login()";
                        return objResultado;
                    }

                    DataUsuario = (SEG_USUARIOView) objResultadoUsuario.Data;
                    if (!VerifyPasswordHash(CLAVE_USUARIO, DataUsuario.CLAVE_USUARIO, DataUsuario.CLAVE_USUARIO_SAL)) {
                        objResultado.Data = null;
                        objResultado.Result = false;
                        objResultado.RowsAffected = 0;
                        objResultado.CodeHelper =  0;
                        objResultado.ErrorCode = -1;
                        objResultado.ErrorMessage = "Usuario o Clave Inválida!";
                        objResultado.ErrorSource = "Login()";
                        return objResultado;
                    }
                }

                if (DataUsuario.ESTADO_USUARIO != UserStatus.Active) {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper =  0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Usuario No esta Activo!";
                    objResultado.ErrorSource = "Login()";
                    return objResultado;
                }

                // Usuario Autenticado y se busca sus Autorizaciones
                var objResultadoPermiso = await _SEG_USUARIO_OPCIONRepository.GetPermisosAsync(LOGIN_SISTEMA, CODIGO_SUITE);
                
                if (objResultadoPermiso.Result  == false) {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper =  0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Usuario o Clave Inválida!";
                    objResultado.ErrorSource = "Login()";

                    return objResultado;
                }

                var Data = new SEG_USUARIO_LOGINView() {
                    LOGIN_SISTEMA = LOGIN_SISTEMA,
                    CODIGO_SUITE = CODIGO_SUITE,
                    TIPO_USUARIO = DataUsuario.TIPO_USUARIO,
                    ESTADO_USUARIO = DataUsuario.ESTADO_USUARIO,
                    CORR_EMPRESA = DataUsuario.CORR_EMPRESA,
                    NOMBRE_EMPRESA = DataUsuario.NOMBRE_EMPRESA,
                    TOKEN = GenerateToken(DataUsuario, CODIGO_SUITE, (List<SEG_USUARIO_PERMISOView>) objResultadoPermiso.Data),
                    OPCIONES = GenerateMenu((List<SEG_USUARIO_PERMISOView>) objResultadoPermiso.Data)
                };

                objResultado.Data = Data;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper =  0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {               
                objResultado.Data = "";
                objResultado.Result = false;
                objResultado.RowsAffected = 0;
                objResultado.CodeHelper =  0;
                objResultado.ErrorCode =  -1;
	    	    objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }

            return objResultado;
        
        }        

        private List<SEG_USUARIO_MENUView> GenerateMenu(List<SEG_USUARIO_PERMISOView> DataPermiso) 
        {
            var DataSistema = new  List<SEG_USUARIO_MENUView>();
            DataSistema.Add(new SEG_USUARIO_MENUView{
                                                codeSistema = "SCUEES",
                                                codeMenu = "PROCESO",
                                                code = "Home",
                                                text = "Home",
                                                icon = "home",
                                                path = "/home",
                                                order = 0,
                                                expanded = true
                                            });

            DataSistema.AddRange(DataPermiso.Select(sistema => 
                                            new SEG_USUARIO_MENUView{
                                                codeSistema = sistema.CODIGO_SISTEMA,
                                                codeMenu = sistema.CODIGO_SISTEMA,
                                                code = sistema.CODIGO_SISTEMA,
                                                text = sistema.NOMBRE_SISTEMA,
                                                icon = sistema.IMAGEN_SISTEMA,
                                                path = "",
                                                order = sistema.ORDEN_SISTEMA,
                                                expanded = true
                                            })
                                            .DistinctBy(x => x.codeSistema)
                                            .OrderBy(x => x.order)
                                            .ToList()
            );

            var DataMenu = DataPermiso.Select(menu => 
                                        new SEG_USUARIO_MENU_OPCIONView{ 
                                            codeSistema = menu.CODIGO_SISTEMA,
                                            codeMenu = menu.CODIGO_MENU,
                                            code = menu.CODIGO_MENU,
                                            text = menu.NOMBRE_MENU,
                                            icon = menu.IMAGEN_MENU,
                                            path = "",
                                            order = menu.ORDEN_MENU,
                                            expanded = true
                                        })
                                        .DistinctBy(x => (x.codeSistema, x.codeMenu))
                                        .OrderBy(x => x.order)
                                        .ToList();

            var DataOpcion = DataPermiso.Select(opcion => 
                                            new SEG_USUARIO_MENU_OPCIONView{ 
                                                codeSistema = opcion.CODIGO_SISTEMA,
                                                codeMenu = opcion.CODIGO_MENU,
                                                code = opcion.CODIGO_OPCION,
                                                text = opcion.NOMBRE_OPCION,
                                                icon = opcion.IMAGEN_OPCION,
                                                path = opcion.URL_OPCION,
                                                order = opcion.ORDEN_OPCION,
                                                expanded = true
                                            })
                                            .DistinctBy(x => x.code)
                                            .OrderBy(x => x.order)
                                            .ToList();

            foreach (var sistema in DataSistema)
            {
                sistema.items = DataMenu.Where(x => x.codeSistema == sistema.codeSistema).ToList();
                foreach(var menu in sistema.items) 
                {
                    menu.items = DataOpcion.Where(x => x.codeSistema == menu.codeSistema && x.codeMenu == menu.codeMenu).ToList();
                }                
            }
            return DataSistema;
        }

        private bool VerifyPasswordHash(string CLAVE_USUARIO, byte[] CLAVE_USUARIOHash, byte[] CLAVE_USUARIO_SAL)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512(CLAVE_USUARIO_SAL))  
            {                
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(CLAVE_USUARIO));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != CLAVE_USUARIOHash[i]) return false;
                }

                return true;
            }
        }  
        
        public string GenerateToken(SEG_USUARIOView Usuario,string CodigoSuite, List<SEG_USUARIO_PERMISOView> Opciones)
        {
            var claims = new[]
            {                
                new Claim(ClaimTypes.NameIdentifier, Usuario.LOGIN_SISTEMA),
                new Claim(ClaimTypes.Name, Usuario.NOMBRE_USUARIO),
                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString()),
                new Claim("TIPO_USUARIO", ((int)Usuario.TIPO_USUARIO).ToString()),
                // new Claim("URL_FOTO_PERFIL",Usuario.URL_FOTO_PERFIL),             
                new Claim("CODIGO_SUITE", CodigoSuite ),
                new Claim("CORR_EMPRESA", Usuario.CORR_EMPRESA.ToString()),
            };
            var appIdentity = new ClaimsIdentity(claims);
            
            foreach (var vOpcion in Opciones)
            {
                if (vOpcion.CODIGO_OPCION != null && vOpcion.PERMISO != null) {
                    var vClaims = appIdentity.Claims.FirstOrDefault(x => x.Type == vOpcion.CODIGO_OPCION);
                    if (vClaims == null)
                        appIdentity.AddClaim(new Claim(vOpcion.URL_OPCION, vOpcion.PERMISO));
                }  
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(_config.GetSection("AppSetting:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = appIdentity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        public async Task<CResult> GetMenuAsync(string LOGIN_SISTEMA, string CODIGO_SUITE)
        {
            var objResultado = new CResult();

            try
            {
                var objResultadoPermiso = await _SEG_USUARIO_OPCIONRepository.GetPermisosAsync(LOGIN_SISTEMA, CODIGO_SUITE);
                
                if (objResultadoPermiso.Result  == false) {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper =  0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Existen problemas para cargar el Menú";
                    objResultado.ErrorSource = "GetMenu()";

                    return objResultado;
                }   

                objResultado.Data = GenerateMenu((List<SEG_USUARIO_PERMISOView>) objResultadoPermiso.Data);
                objResultado.Result = true;
                objResultado.RowsAffected = 0;
                objResultado.CodeHelper =  0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "GetMenu()";


            }
            catch (System.Exception e)
            {               
                objResultado.Data = "";
                objResultado.Result = false;
                objResultado.RowsAffected = 0;
                objResultado.CodeHelper =  0;
                objResultado.ErrorCode =  -1;
	    	    objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }            

            return objResultado;
        }

        public string GenerateRptToken(string username)
        {
            // appsetting for Token JWT
            var secretKey = _config.GetSection("AppSetting:TokenRpt").Value;
            var audienceToken = _config.GetSection("AppSetting:apiRptURL").Value; //ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"];
            var issuerToken = _config.GetSection("AppSetting:apiRptURL").Value;; //ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"];
            var expireTime = 30; //ConfigurationManager.AppSettings["JWT_EXPIRE_MINUTES"];
            
            var securityKey = new SymmetricSecurityKey(System.Text.Encoding.Default.GetBytes(secretKey));
            var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

            // create a claimsIdentity
            ClaimsIdentity claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });

            // create token to the user
            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jwtSecurityToken = tokenHandler.CreateJwtSecurityToken(
                audience: audienceToken,
                issuer: issuerToken,
                subject: claimsIdentity,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToInt32(expireTime)),
                signingCredentials: signingCredentials);

            var jwtTokenString = tokenHandler.WriteToken(jwtSecurityToken);
            return jwtTokenString;
        }
    
        #region "Detalle de opciones"
        public async Task<CResult> GetAllSEG_USUARIO_OPCION(SEG_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "@TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 }
            };

			return await _SEG_USUARIO_OPCIONRepository.GetAllAsync(p);
		}    
        public async Task<CResult> UpdateSEG_USUARIO_OPCIONAsync(SEG_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _SEG_USUARIO_OPCIONRepository.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
        #endregion
        public async Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CambioClave(Data, vLOGIN_SISTEMA, vESTACION);
		}

        public async Task<CResult> getUSUARIO_PERMISOS(string vLOGIN_SISTEMA,string CODIGO_SUITE)
		{
            var pWhere = new List<CParameter>
            {
                new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String }
            };

            var objResultadoUsuario = await GetAsync(pWhere);
            var DataUsuario = (SEG_USUARIOView) objResultadoUsuario.Data;

			return await _SEG_USUARIO_OPCIONRepository.GetPermisosAsync(vLOGIN_SISTEMA, CODIGO_SUITE);
		}

        public async Task<CResult> GetAllSEG_USUARIO_LOOKUP(SEG_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "@TIPO_CONSULTA", Value = QueryType.AllRowsComboBox, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "@OPCION_CONSULTA", Value = 2, DbType = System.Data.DbType.Int32 }
            };

			return await _repo.GetAllAsync(p);
		} 
	}
}
