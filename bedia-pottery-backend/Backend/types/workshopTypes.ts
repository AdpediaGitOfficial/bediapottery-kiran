import mongoose, { Document, Types } from 'mongoose';

/* ---------------- TIME SLOT ---------------- */
export interface ITimeSlot {
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
}

/* ---------------- WORKSHOP DATE ---------------- */
export interface IWorkshopDate {
  date: string;
  slots: ITimeSlot[];
}

/* ---------------- WORKSHOP OPTION ---------------- */
export interface IWorkshopOption {
  _id?: Types.ObjectId;
  clayType?: string | null;
  title: string;
  price: number;
  currency?: string | null;
  priceDescription?: string | null;
  description?: string | null;
  inclusions?: string[] | undefined;
  image?: string;
}

export interface IWorkshopOptionBody {
  clayType?: string | null;
  title: string;
  price: number;
  currency?: string | null;
  priceDescription?: string | null;
  description?: string | null;
  inclusions?: string[] | undefined;
  image?: string;
}

/* ---------------- FAQ ---------------- */
export interface IFaq {
  question: string;
  answer: string;
}
export interface IDefaultSlot {
  _id?: Types.ObjectId;
  label: string; // Morning / Evening
  startTime: string; // "10:00"
  endTime: string; // "12:00"
  capacity: number;
}

export interface IWorkshopInclude {
  title: string;
  icon?: string;
}

export interface IWorkshopMoreDetails {
  title: string;
  icon?: string;
  description?: string;
}

export interface IDefaultSlotBody {
  label: string;
  startTime: string;
  endTime: string;
  capacity?: number;
}

export interface IWorkshopImage {
  image: string;
  title?: string;
}
/* ---------------- MAIN WORKSHOP MODEL ---------------- */
export interface IWorkshopModel extends Document {
  title: string;
  slug: string;
  bannerImage?: string;
  images: IWorkshopImage[];
  categoryId: Types.ObjectId;
  shortDescription: string;
  description: string;
  overview?: string;
  defaultSlots: IDefaultSlot[];
  options: IWorkshopOption[];
  nonAvailabilityDates: string[];
  nonAvailabilityDays: string[];
  type?: string;
  // faq: IFaq[];
  // termsAndConditions: string;
  showOnHomepage?: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  includes?: IWorkshopInclude[];
  moreDetails?: IWorkshopMoreDetails[];
  journeyImage?: string[];
}

/* ---------------- REQUEST BODY (CREATE / UPDATE) ---------------- */
export interface IWorkshopBody {
  title: string;
  bannerImage?: string | null;
  images: IWorkshopImage[];
  categoryId: string;
  shortDescription: string;
  description: string;
  overview?: string;
  defaultSlots: IDefaultSlotBody[];
  options: IWorkshopOptionBody[];
  nonAvailabilityDates?: string[];
  nonAvailabilityDays?: string[];
  // faq?: IFaq[];
  // termsAndConditions?: string;
  isActive?: boolean;
  showOnHomepage?: boolean;
  type?: string;
  includes?: IWorkshopInclude[];
  moreDetails?: IWorkshopMoreDetails[];
  journeyImage?: string[];
}

/* ---------------- LIST QUERY ---------------- */
export interface IGetAllQuery {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  isActive?: string;
  slug?: string;
}
export interface ICreateWorkshopBookingBody {
  workshops: {
    workshopId: string;
    bookingDate: string; // YYYY-MM-DD
    slotId: string;

    items: {
      optionId: string;
      people: number;
    }[];
  }[];
  personalMessage?: string;
  occasion?: string;
  giftFor?: string;
  customer: {
    firstName: string;
    lastName: string;
    companyName?: string;
    notes?: string;
    country?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone: string;
    email: string;
  };
}

export interface IWorkshopBooking {
  workshopId: mongoose.Types.ObjectId;
  bookingDate: string;
  slotId: mongoose.Types.ObjectId;
  bookingNumber: string;
  currency: string;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  userId?: mongoose.Types.ObjectId;
  items: {
    clayTypeId?: mongoose.Types.ObjectId;
    title: string;
    price: number;
    people: number;
    subtotal: number;
  }[];

  totalPeople: number;
  totalAmount: number;

  customer: {
    firstName: string;
    lastName: string;
    companyName?: string;
    notes?: string;
    country?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone: string;
    email: string;
  };

  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  personalMessage?: string;
  occasion?: string;
  giftFor?: string;
  isDeleted: boolean;
}

export interface IWorkshopBookingDetail {
  _id: string;
  bookingNumber: string;
  bookingDate: string;

  workshopTitle: string;

  slotStartTime: string;
  slotEndTime: string;

  items: {
    optionTitle: string;
    price: number;
    people: number;
    subtotal: number;
  }[];

  totalPeople: number;
  totalAmount: number;
  currency: string;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;

  bookingStatus: string;
  paymentStatus: string;
  personalMessage?: string;
  occasion?: string;
  giftFor?: string;
  customer: {
    firstName: string;
    lastName: string;
    companyName?: string;
    notes?: string;
    country?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone: string;
    email: string;
  };

  createdAt: Date;
}

export interface ICheckoutCartBody {
  userId: string;
  customer: {
    firstName: string;
    lastName: string;
    companyName?: string | null;
    notes?: string | null;
    country?: string;
    address?: string;
    city?: string;
    state?: string | null;
    zipCode?: string | null;
    phone: string;
    email: string;
  };
}
