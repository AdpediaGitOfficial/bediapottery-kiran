import { Document, Types } from 'mongoose';

export interface ICartModel extends Document {
  userId: Types.ObjectId;

  items: {
    workshopId: Types.ObjectId;
    bookingDate: string;
    slotId: Types.ObjectId;

    optionId: Types.ObjectId;

    people: number;
    price: number;
    subtotal: number;

    currency?: string;
  }[];

  totalPeople: number;
  totalAmount: number;

  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
}
