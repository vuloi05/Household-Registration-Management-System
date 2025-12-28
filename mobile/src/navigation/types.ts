// src/navigation/types.ts

// Define the shape of a single notification object
export interface Notification {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

export type RootStackParamList = {
  MainTabs: undefined;
  NewsArticle: {
    url: string;
    title?: string;
  };
  NotificationDetail: {
    notification: Notification;
  };
};


