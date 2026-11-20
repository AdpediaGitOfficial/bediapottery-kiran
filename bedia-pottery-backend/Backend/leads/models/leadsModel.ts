import { Schema, model } from 'mongoose';
import { ILeadsModel } from '../../types/leadsTypes';

const leadsDataSchema = new Schema<ILeadsModel>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferredLanguage: { type: String },
    propertyType: { type: String },
    propertySlug: { type: String },
    message: { type: String },
    preferredArea: { type: String },
    idealBudget: { type: String },
    bedrooms: { type: String },
    userType: { type: String },
    expectedPurchaseTime: { type: String },
    preferredContactMethod: { type: String },
    preferredContactTime: { type: String },
    preferredDate: { type: String },
    propertyIdentifier: { type: String },
    leadType: { type: String, default: 'General' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const leadModel = model<ILeadsModel>('leads', leadsDataSchema);
export default leadModel;
