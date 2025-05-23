@echo off
echo 🧪 Health CRM 功能测试指南
echo =====================================

echo.
echo 🔐 登录测试账户:
echo 管理员: admin@healthcrm.com / 123456
echo 医生: dr.johnson@healthcrm.com / 123456
echo.
echo 🎯 功能测试清单:
echo.
echo 【患者管理】
echo ✓ 查看患者列表 (支持分页、搜索、排序)
echo ✓ 高级过滤 (类型、优先级、状态、医生)
echo ✓ 分类查看 (全部、需回访、药物不足、紧急)
echo ✓ 新增患者 (完整表单验证)
echo ✓ 编辑患者信息
echo ✓ 删除患者 (权限控制)
echo.
echo 【用户管理】(仅管理员可见)
echo ✓ 查看用户列表 (分角色tab查看)
echo ✓ 按部门过滤
echo ✓ 排序功能
echo ✓ 权限控制 (管理员对系统管理员只读)
echo.
echo 【重要提醒功能】
echo ✓ 回访日期提醒 (红色警告图标)
echo ✓ 药物不足提醒 (橙色警告)
echo ✓ 紧急患者标识
echo.
echo 【数据库测试数据】
echo ✓ 5个用户 (不同角色)
echo ✓ 5个患者 (包含中文姓名)
echo ✓ 包含各种优先级和状态
echo ✓ 模拟真实的医疗场景
echo.
echo 🚀 开始测试: npm run dev
echo 🌐 访问地址: http://localhost:3000
echo.
pause
