using DemoMVC.Services;

namespace DemoMVC;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllersWithViews();
        
        // 註冊番茄鐘資料服務
        builder.Services.AddScoped<IPomodoroDataService, PomodoroDataService>();
        
        // 註冊地球儀資料服務
        builder.Services.AddScoped<IGlobeDataService, GlobeDataService>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        // 暫時註解掉 HTTPS 重定向，避免開發環境問題
        // app.UseHttpsRedirection();
        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthorization();

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");

        app.Run();
    }
}
