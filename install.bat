@echo off
echo 🚀 Health CRM 项目安装脚本
echo =============================

echo.
echo 🧹 清理旧的依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 安装依赖包...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 依赖安装失败，尝试使用 --legacy-peer-deps 选项...
    call npm install --legacy-peer-deps
)

echo.
echo 🗄️ 初始化数据库...
call npm run seed

echo.
echo ✅ 安装完成！
echo.
echo 🔥 启动开发服务器:
echo npm run dev
echo.
echo 🌐 然后访问: http://localhost:3000
echo.
echo 👤 测试账户:
echo 管理员: admin@healthcrm.com / admin123
echo 医生: dr.johnson@healthcrm.com / doctor123
echo 护士: nurse.wong@healthcrm.com / nurse123
echo 前台: receptionist@healthcrm.com / reception123
echo.
pause
