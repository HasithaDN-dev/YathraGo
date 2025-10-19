export type ReceiverType = 'CUSTOMER' | 'CHILD' | 'STAFF' | 'DRIVER' | 'WEBUSER' | 'VEHICLEOWNER' | 'BACKUPDRIVER';

// Export a notification DTO shape used by the UI
export type NotificationDto = {
  id: number | string;
  sender: string;
  message: string;
  type: string;
  isExpanded: boolean;
  time: string;
};
