@echo off
echo 🏥 Health CRM 启动脚本
echo =======================

echo.
echo 🔥 启动开发服务器...
echo 🌐 正在访问: http://localhost:3000
echo.
echo 👤 测试账户信息:
echo --------------------------------
echo 管理员: admin@healthcrm.com / admin123
echo 医生: dr.johnson@healthcrm.com / doctor123  
echo 护士: nurse.wong@healthcrm.com / nurse123
echo 前台: receptionist@healthcrm.com / reception123
echo --------------------------------
echo.
echo 💡 按 Ctrl+C 停止服务器
echo.

call npm run dev
