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
        
        // 註冊備忘錄資料服務
        builder.Services.AddScoped<IMemorandumDataService, MemorandumDataService>();
        
        // 註冊留言板服務
        builder.Services.AddSingleton<IMessageBoardService, MessageBoardService>();
        
        // 設定 Session (用於使用者識別)
        builder.Services.AddSession(options =>
        {
            options.IdleTimeout = TimeSpan.FromDays(7);
            options.Cookie.HttpOnly = false; // 允許前端存取
            options.Cookie.IsEssential = true;
        });

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
        
        // 啟用 Session
        app.UseSession();

        app.UseAuthorization();

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");

        app.Run();
    }
}
