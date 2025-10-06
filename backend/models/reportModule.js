const mongoose = require('mongoose');

const reportNotificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
    default: 'daily'
  },
  time: {
    type: String,
    required: true,
    default: '09:00',
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  timeZone: {
    type: String,
    required: false,
    default: 'America/Toronto' // Eastern Time default
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: function() {
      return this.frequency === 'weekly';
    }
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    required: function() {
      return this.frequency === 'monthly';
    }
  },
  channels: {
    email: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  recipients: {
    super_admin: {
      type: Boolean,
      default: false
    },
    owner: {
      type: Boolean,
      default: false
    },
    district_manager: {
      type: Boolean,
      default: false
    },
    general_manager: {
      type: Boolean,
      default: false
    },
    employee: {
      type: Boolean,
      default: false
    }
  },
  filters: {
    restaurants: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all'
    },
    sections: {
      type: String,
      enum: ['all', 'specific'],
      default: 'all'
    },
    dateRange: {
      type: Number,
      default: 7,
      min: 1
    },
    selectedRestaurants: [{
      type: String, // Restaurant ID
      required: false
    }],
    selectedSections: [{
      type: String, // Section ID
      required: false
    }]
  },
  active: {
    type: Boolean,
    default: true
  },
  recipientCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSent: {
    type: Date,
    default: null
  },
  nextSend: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
reportNotificationSchema.index({ createdBy: 1 });
reportNotificationSchema.index({ active: 1 });
reportNotificationSchema.index({ nextSend: 1 });
reportNotificationSchema.index({ frequency: 1 });

// Instance methods
reportNotificationSchema.methods.calculateNextSend = function() {
  const now = new Date();
  const [hours, minutes] = this.time.split(':').map(Number);

  switch (this.frequency) {
    case 'daily':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow;

    case 'weekly':
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(this.dayOfWeek.toLowerCase());
      const currentDay = now.getDay();
      
      let daysUntilTarget = (targetDay - currentDay + 7) % 7;
      if (daysUntilTarget === 0) daysUntilTarget = 7;
      
      const nextWeekly = new Date(now);
      nextWeekly.setDate(now.getDate() + daysUntilTarget);
      nextWeekly.setHours(hours, minutes, 0, 0);
      return nextWeekly;

    case 'monthly':
      const nextMonthly = new Date(now);
      nextMonthly.setMonth(now.getMonth() + 1);
      nextMonthly.setDate(Math.min(this.dayOfMonth, new Date(nextMonthly.getFullYear(), nextMonthly.getMonth() + 1, 0).getDate()));
      nextMonthly.setHours(hours, minutes, 0, 0);
      return nextMonthly;

    default:
      return null;
  }
};

// Pre-save middleware to calculate nextSend
reportNotificationSchema.pre('save', function(next) {
  if (this.isModified('frequency') || this.isModified('time') || this.isModified('dayOfWeek') || this.isModified('dayOfMonth') || this.isNew) {
    this.nextSend = this.calculateNextSend();
  }
  next();
});

module.exports = mongoose.model('ReportNotification', reportNotificationSchema);