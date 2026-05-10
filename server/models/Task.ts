import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  assignedTo: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  deadline: { type: Date },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
