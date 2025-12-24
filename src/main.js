import {
	createSSRApp
} from "vue";
import App from "./App.vue";

export function createApp() {
	const app = createSSRApp(App);
	
	// 全局错误处理，捕获WebSocket相关错误
	app.config.errorHandler = (err, instance, info) => {
		// 检查是否是WebSocket关闭代码错误（特别是1006错误）
		const errorString = err && (err.message || err.errMsg || String(err));
		if (errorString && (errorString.includes("closeSocket") || errorString.includes("WebSocket")) && errorString.includes("1006")) {
			console.warn("捕获到WebSocket关闭代码错误，已忽略:", errorString);
			// 忽略此错误，不向上抛出
			return;
		}
		// 其他错误正常处理
		console.error("全局错误:", err, info);
	};
	
	// 添加全局错误监听器，捕获系统级错误
	if (typeof uni !== 'undefined' && typeof plus !== 'undefined') {
		plus.globalEvent.addEventListener('error', (e) => {
			const errorInfo = e.message || e.errMsg || String(e);
			if ((errorInfo.includes("closeSocket") || errorInfo.includes("WebSocket")) && errorInfo.includes("1006")) {
				console.warn("捕获到系统级WebSocket错误，已忽略:", errorInfo);
				return;
			}
			console.error("系统级错误:", e);
		});
	}
	
	return {
		app,
	};
}
