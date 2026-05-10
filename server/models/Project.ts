import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
