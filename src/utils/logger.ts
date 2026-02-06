export class Logger {
  static info(message: string, data?: any) {
    console.log(`\n📡 [INFO] ${new Date().toLocaleTimeString()} - ${message}`);
    if (data) console.log('   Details:', data);
  }

  static success(message: string, data?: any) {
    console.log(`✅ [SUCCESS] ${new Date().toLocaleTimeString()} - ${message}`);
    if (data) console.log('   Details:', data);
  }

  static error(message: string, error?: any) {
    console.error(`❌ [ERROR] ${new Date().toLocaleTimeString()} - ${message}`);
    if (error) console.error('   Error:', error);
  }

  static warn(message: string, data?: any) {
    console.warn(`⚠️  [WARN] ${new Date().toLocaleTimeString()} - ${message}`);
    if (data) console.warn('   Details:', data);
  }

  static request(method: string, path: string, userId?: string) {
    const user = userId ? ` [User: ${userId}]` : '';
    console.log(`📨 [${method}] ${path}${user}`);
  }

  static response(method: string, path: string, status: number, message: string) {
    const icon = status < 400 ? '📤' : '⚠️ ';
    console.log(`${icon} [${method}] ${path} → ${status} ${message}`);
  }
}

export default Logger;
