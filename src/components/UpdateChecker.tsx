import { UpdateService } from "@/services/update.service";
import React, { useCallback, useEffect } from "react";
import { Alert, Button, View } from "react-native";

interface UpdateCheckerProps {
  autoCheck?: boolean;
  showManualButton?: boolean;
}

export default function UpdateChecker({
  autoCheck = true,
  showManualButton = true,
}: UpdateCheckerProps) {
  const checkForUpdates = useCallback(async () => {
    const hasUpdate = await UpdateService.checkForUpdate();

    if (hasUpdate) {
      Alert.alert(
        "Update Available",
        "A new version of the app is available. Would you like to update now?",
        [
          {
            text: "Later",
            style: "cancel",
          },
          {
            text: "Update Now",
            onPress: async () => {
              await applyUpdate();
            },
          },
        ]
      );
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      checkForUpdates();
    }
  }, [autoCheck, checkForUpdates]);

  const applyUpdate = async () => {
    Alert.alert("Updating", "Downloading update...");

    try {
      await UpdateService.fetchUpdate();
      Alert.alert(
        "Update Ready",
        "The update has been downloaded. The app will restart to apply the changes.",
        [
          {
            text: "Restart Now",
            onPress: () => UpdateService.reloadApp(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Update Failed", "There was an error updating the app.");
    }
  };

  if (!showManualButton) return null;

  return (
    <View style={{ padding: 20 }}>
      <Button title="Check for Updates" onPress={checkForUpdates} />
    </View>
  );
}
