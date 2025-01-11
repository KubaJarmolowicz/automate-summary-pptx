export class LogService {
  async logError(context: string, error: Error): Promise<void> {
    console.error(`[${context}] Error:`, error);
    // Add your error logging logic here
  }
}
