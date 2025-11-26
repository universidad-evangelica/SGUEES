using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace eFrameworkAPI.Core
{
    public class CData
    {
        public string UrlAPI { get; set; }
        public string Token { get; set; } = "";

        private HttpClient objClient = new HttpClient();
        private HttpClient objClientForm = new HttpClient();

        public CData(string xUrlAPI)
        {
            UrlAPI = xUrlAPI;
            objClient.DefaultRequestHeaders.Accept.Clear();
            objClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            objClient.Timeout = TimeSpan.FromMinutes(1);
            objClient.DefaultRequestHeaders.UserAgent.ParseAdd("e-AdminFE/1.0");

            objClientForm.DefaultRequestHeaders.Accept.Clear();
            objClientForm.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/x-www-form-urlencoded"));
            objClientForm.Timeout = TimeSpan.FromMinutes(1);
            objClientForm.DefaultRequestHeaders.UserAgent.ParseAdd("e-AdminFE/1.0");
        }

        public async Task<CResult<TData>> GetAsync<TData>(string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData>  objResultado;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList.Count > 0)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.GetAsync(builder.Uri);
                objResultado = JsonSerializer.Deserialize<CResult<TData>>(vResponse.Content.ReadAsStringAsync().Result);

                if (objResultado != null)
                {
                    return objResultado;
                }

                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorMessage = $"{vResponse.StatusCode.ToString()}"
                };

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
            
        }
        public async Task<CResult<TData>> GetDataAsync<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            TData vData;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.GetAsync(builder.Uri);

                if (vResponse.IsSuccessStatusCode) 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                    objResultado.Data = vData;

                    return objResultado;
                } else 
                {
                    var vError = vResponse.Content.ReadAsStringAsync().Result;
                    objResultado = new CResult<TData>
                    {
                        Result = false,
                        ErrorCode = -1,
                        CodeHelper = 0,
                        RowsAffected = 0,
                        ErrorMessage = $"{vResponse.StatusCode} {vError}"
                    };
                }

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }
        public async Task<CResult<TData>> PostAsync<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));
                objResultado = JsonSerializer.Deserialize<CResult<TData>>(vResponse.Content.ReadAsStringAsync().Result);

                if (objResultado != null)
                {
                    return objResultado;
                }

                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorMessage = $"{vResponse.StatusCode.ToString()}"
                };

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<Stream> PostStreamAsync<TContent>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }
            string objSerilized = JsonSerializer.Serialize(xContent);
            UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
            if (xQueryList != null)
            {
                builder.Query = getQuery(xQueryList);
            }
            HttpResponseMessage vResponse = objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json")).Result;
            
            if (vResponse.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return await vResponse.Content.ReadAsStreamAsync();
            }

            return null;
        }

        public async Task<CResult<TData>> PutAsync<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PutAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));
                objResultado = JsonSerializer.Deserialize<CResult<TData>>(vResponse.Content.ReadAsStringAsync().Result);

                if (objResultado != null)
                {
                    return objResultado;
                }

                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorMessage = $"{vResponse.StatusCode.ToString()}"
                };

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<CResult<TData>> PostDataAsync<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            TData vData;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));
                
                 if (vResponse.IsSuccessStatusCode) 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                    objResultado.Data = vData;

                    return objResultado;
                } else 
                {
                    var vError = vResponse.Content.ReadAsStringAsync().Result;
                    objResultado = new CResult<TData>
                    {
                        Result = false,
                        ErrorCode = -1,
                        CodeHelper = 0,
                        RowsAffected = 0,
                        ErrorMessage = $"{vResponse.StatusCode} {vError}"
                    };
                }

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<CResult<TData>> PostData2Async<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            TData vData;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));
                
                 if (vResponse.IsSuccessStatusCode) 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Data = vData;
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                } else 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Data = vData;
                    objResultado.Result = false;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = $"{vResponse.StatusCode}";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 0;
                }
                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<CResult<TData>> PostData3Async<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));
                
                /*if (vResponse.IsSuccessStatusCode) 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                    objResultado.Data = vData;

                    return objResultado;
                } else 
                {*/
                    var vError = vResponse.Content.ReadAsStringAsync().Result;
                    objResultado = new CResult<TData>
                    {
                        Result = false,
                        ErrorCode = -1,
                        CodeHelper = 0,
                        RowsAffected = 0,
                        ErrorMessage = $"{vResponse.StatusCode} {vError}"
                    };
                //}

                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorMessage = $"{vResponse.StatusCode}"
                };

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<CResult<TData>> PostDataFormAsync<TData>(IDictionary<string, string> xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            TData vData;
            try
            {
                objClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("*/*"));
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                var formList = new List<KeyValuePair<string, string>>();
                foreach (var item in xContent)
                {
                    formList.Add(new KeyValuePair<string, string>(item.Key, item.Value));
                }
                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new FormUrlEncodedContent(formList));

                if (vResponse.IsSuccessStatusCode) 
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                    objResultado.Data = vData;
                    
                    return objResultado;
                } else 
                {
                    var vError = vResponse.Content.ReadAsStringAsync().Result;
                    objResultado = new CResult<TData>
                    {
                        Result = false,
                        ErrorCode = -1,
                        CodeHelper = 0,
                        RowsAffected = 0,
                        ErrorMessage = $"{vResponse.StatusCode.ToString()} {vError}"
                    };
                }

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public MultipartFormDataContent xFormContent;
        public async Task<CResult<TData>> PostDataFormDocAsync<TData>(MultipartFormDataContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado = new();
            TData vData;
            try
            {
                objClientForm.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("*/*"));
                if (Token != "") { objClientForm.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token.Replace("Bearer ","")); }

                UriBuilder builder = new(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClientForm.PostAsync(builder.Uri, xContent);

                if (vResponse.IsSuccessStatusCode)
                {
                    vData = JsonSerializer.Deserialize<TData>(vResponse.Content.ReadAsStringAsync().Result);
                    objResultado.Result = true;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = "";
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 1;
                    objResultado.Data = vData;

                    return objResultado;
                }
                else
                {
                    var vError = vResponse.Content.ReadAsStringAsync().Result;
                    objResultado = new CResult<TData>
                    {
                        Result = false,
                        ErrorCode = -1,
                        CodeHelper = 0,
                        RowsAffected = 0,
                        ErrorMessage = $"{vResponse.StatusCode.ToString()} {vError}"
                    };
                }

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        public async Task<CResult<TData>> DeleteAsync<TData>(string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.DeleteAsync(builder.Uri);
                objResultado = JsonSerializer.Deserialize<CResult<TData>>(vResponse.Content.ReadAsStringAsync().Result);

                if (objResultado != null)
                {
                    return objResultado;
                }

                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorMessage = $"{vResponse.StatusCode.ToString()}"
                };

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>
                {
                    Result = false,
                    ErrorCode = -1,
                    CodeHelper = 0,
                    RowsAffected = 0,
                    ErrorSource = e.Source,
                    ErrorMessage = e.Message
                };

                return objResultado;
            }
        }

        private string getQuery(IDictionary<string, object> xQueryList)
        {
            string vQuery="";

            foreach (var item in xQueryList)
            {
                if (vQuery != "") { vQuery += "&"; }
                if (item.Value is DateTime)
                {
                    vQuery += $"{item.Key}={((DateTime)item.Value).ToString("yyyy-MM-ddTHH:mm:ss")}";
                }
                else
                {
                    var vValue = "";
                    if (item.Value == null )
                    {
                        vValue = "null";
                    } else
                    {
                        vValue = item.Value.ToString();
                    }
                    vQuery += $"{item.Key}={vValue}";
                }
            }

            return vQuery;
        }

        public async Task<CResult<TData>> Post<TContent, TData>(TContent xContent, string xController, string xMetodo, IDictionary<string, object> xQueryList = null)
        {
            CResult<TData> objResultado;
            try
            {
                if (Token != "") { objClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Token); }

                string objSerilized = JsonSerializer.Serialize(xContent);

                UriBuilder builder = new UriBuilder(UrlAPI + xController + "/" + xMetodo);
                if (xQueryList != null)
                {
                    builder.Query = getQuery(xQueryList);
                }

                HttpResponseMessage vResponse = await objClient.PostAsync(builder.Uri, new StringContent(objSerilized, Encoding.UTF8, "application/json"));

                if (vResponse.IsSuccessStatusCode)
                {
                    objResultado = JsonSerializer.Deserialize<CResult<TData>>(vResponse.Content.ReadAsStringAsync().Result);
                }
                else
                {
                    objResultado = new CResult<TData>();
                    objResultado.Result = false;
                    objResultado.ErrorCode = -1;
                    objResultado.CodeHelper = 0;
                    objResultado.RowsAffected = 0;
                    objResultado.ErrorSource = xMetodo;
                    objResultado.ErrorMessage = vResponse.StatusCode.ToString();
                }

                if (objResultado != null)
                {
                    return objResultado;
                }

                objResultado = new CResult<TData>();
                objResultado.Result = false;
                objResultado.ErrorCode = -1;
                objResultado.CodeHelper = 0;
                objResultado.RowsAffected = 0;
                objResultado.ErrorMessage = $"{vResponse.StatusCode.ToString()}";

                return objResultado;
            }
            catch (Exception e)
            {
                objResultado = new CResult<TData>();
                objResultado.Result = false;
                objResultado.ErrorCode = -1;
                objResultado.CodeHelper = 0;
                objResultado.RowsAffected = 0;
                objResultado.ErrorSource = e.Source;
                objResultado.ErrorMessage = e.Message;

                return objResultado;
            }
        }
    }
}
