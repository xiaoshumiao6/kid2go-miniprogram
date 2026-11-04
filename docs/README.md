# 小芽趣玩：GitHub 图片访问测试

这个独立页面只测试5张历史实景缩略图的访问，不包含小程序工程、数据库导出、账号标识、云端配置或密钥，也不会修改正式版。

## 部署

在仓库 Settings → Pages 中，选择 Deploy from a branch，分支 main，目录 /docs，保存。

预期页面地址（启用和构建成功后才有效）：

https://xiaoshumiao6.github.io/kid2go-miniprogram/

官方设置说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

本包无需 npm、依赖安装、付费套餐、LFS、自定义 Actions 或任何密钥。

## 测试

1. 手机关闭代理，先在 Wi-Fi 下打开页面，填网络备注。
2. 选择本站 GitHub Pages，点击“加载5张图片”，记录成功率和耗时；相同地址再测一次，观察可能的缓存效果。
3. 可点击“换查询参数再测”，但不能把该结果称作完全冷缓存结果。
4. 在移动网络下重复以上操作；可再选择 GitHub Raw 对照。
5. 记录仅在页面内存中，可复制保存，不会自动上传。单图20秒超时。

这5张图片是 Wikimedia 已提供的约500px小预览，单张约38–75KiB，共约268KiB，并非最终规格的正式封面。正式选图、最终大小测试和小程序真机验收仍需另行完成。一次成功不能证明全国、各运营商或长期稳定。

## 图片许可与范围

请保留逐图的作者、来源、许可链接及历史拍摄日期，见 ATTRIBUTION.md 和 sources.json。图片各自适用自己的许可，不因放在同一仓库而统一改用其他许可。

本次仅原样复制来源站的小预览，不再裁切、压缩、调色、去署名或生成场景。页面使用 contain 显示全图。后续改图须另行记录处理并遵循适用许可。

许可核对与本地初看仅用于这批独立访问测试，不是场所现状、完整权利审查或正式封面上线批准。作者与相关场所未因此背书本项目。
