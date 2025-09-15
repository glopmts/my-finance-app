import * as Updates from "expo-updates";

export class UpdateService {
  static async checkForUpdate(): Promise<boolean> {
    try {
      const update = await Updates.checkForUpdateAsync();
      return update.isAvailable;
    } catch (error) {
      console.error("Error checking for update:", error);
      return false;
    }
  }

  static async fetchUpdate(): Promise<void> {
    try {
      await Updates.fetchUpdateAsync();
    } catch (error) {
      console.error("Error fetching update:", error);
    }
  }

  static async reloadApp(): Promise<void> {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error reloading app:", error);
    }
  }

  static async checkAndApplyUpdates(): Promise<boolean> {
    try {
      const isAvailable = await this.checkForUpdate();

      if (isAvailable) {
        await this.fetchUpdate();
        await this.reloadApp();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error in update process:", error);
      return false;
    }
  }
}
