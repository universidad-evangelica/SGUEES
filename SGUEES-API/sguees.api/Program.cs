using System.Net;
using System.Text;
using sguees.api.framework;
using sguees.api.Policies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using NetCore.AutoRegisterDi;
<<<<<<< HEAD
using sguees.api.Data;
=======
using csuees.api.Data;
>>>>>>> 454bd78 (Rediseño general aplicativo SGUEES#31)

=======
using csuees.api.Data;
>>>>>>> 454bd78 (Rediseño general aplicativo SGUEES#31)

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = null;
                    options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());    
                    options.JsonSerializerOptions.Converters.Add(new StringConverter());    
                });

//Mapeo archivo ApplicacionDataContext que contiene los servicios de acceso a datos
builder.Services.AddScoped<ApplicationDataContext>();

// Bind AI options and register model router (from eFrameworkAPI options)
var aiOptions = new eFrameworkAPI.Core.Options.AIOptions();
builder.Configuration.GetSection(eFrameworkAPI.Core.Options.AIOptions.SectionName).Bind(aiOptions);
builder.Services.AddSingleton(aiOptions);
builder.Services.AddSingleton<eFrameworkAPI.Core.AI.IAIModelRouter, eFrameworkAPI.Core.AI.AIModelRouter>();
// Ollama options + HttpClient
var ollamaOptions = new eFrameworkAPI.Core.Options.OllamaOptions();
builder.Configuration.GetSection(eFrameworkAPI.Core.Options.OllamaOptions.SectionName).Bind(ollamaOptions);
builder.Services.AddSingleton(ollamaOptions);
builder.Services.AddHttpClient("ollama", client =>
{
    client.BaseAddress = new Uri(ollamaOptions.BaseUrl);
});
builder.Services.AddSingleton<eFrameworkAPI.Core.AI.IAIProvider, eFrameworkAPI.Core.AI.OllamaAIProvider>();
// QA options evaluator
builder.Services.AddSingleton<eFrameworkAPI.Core.QA.IOptionsQAEvaluator, eFrameworkAPI.Core.QA.OptionsQAEvaluator>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.RegisterAssemblyPublicNonGenericClasses()
            .Where(c => c.Name.EndsWith("Repository") || c.Name.EndsWith("Service") )
            .AsPublicImplementedInterfaces(ServiceLifetime.Scoped);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII
            .GetBytes(builder.Configuration.GetSection("AppSetting:Token").Value)),
            ValidateIssuer = false,
            ValidateAudience = false
    };
});

// Politicas de autorización
builder.Services.AddAuthorization();            
builder.Services.AddSingleton<IAuthorizationPolicyProvider, AuthorizationPolicyProvider>();
builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler(builder =>
    {
        builder.Run(async context =>
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var error = context.Features.Get<IExceptionHandlerFeature>();
            if (error != null)
            {
                context.Response.AddApplicationError(error.Error.Message);
                await context.Response.WriteAsync(error.Error.Message);
            }
        });
    });
}

// app.UseHttpsRedirection();
app.UseCors(options => options.AllowAnyOrigin()
            // options.WithOrigins(builder.Configuration.GetSection("AppSetting:clientURL").Value)
            .AllowAnyMethod()
            .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
