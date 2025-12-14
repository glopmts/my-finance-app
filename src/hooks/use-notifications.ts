import * as Notifications from "expo-notifications";

const UPDATE_NOTIFICATION_ID = "app-update-notification";

export async function showUpdateNotification(title: string, body: string) {
  await Notifications.dismissNotificationAsync(UPDATE_NOTIFICATION_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: UPDATE_NOTIFICATION_ID,
    content: {
      title,
      body,
    },
    trigger: null,
  });
}
