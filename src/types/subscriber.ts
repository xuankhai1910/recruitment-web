export interface Subscriber {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriberDto {
  name: string;
  email: string;
  skills: string[];
}
