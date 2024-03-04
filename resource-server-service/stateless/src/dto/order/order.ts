export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type Item = {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
};

export type CreateOrder = {
  customer: Customer;
  items: Item[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
};

export type Order = {
  id: string;
  created: string;
  customer: Customer;
  items: Item[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
};
