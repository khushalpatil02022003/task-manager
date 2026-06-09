const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'title is required and must be a non-empty string'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false,
    required: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: "priority must be 'low', 'medium', or 'high'"
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must belong to a user']
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Create virtual 'id' mapping from '_id' for backward compatibility
taskSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Configure serialization to include virtuals and exclude internal keys
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
