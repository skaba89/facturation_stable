// Placeholder for User model (e.g., using Sequelize or similar ORM)

const userSchema = {
  username: {
    type: 'String',
    unique: true,
    required: true,
  },
  email: {
    type: 'String',
    unique: true,
    required: true,
    // Add validation for email format
  },
  password: {
    type: 'String',
    required: true,
    // Password will be hashed
  },
  profile_type: {
    type: 'Enum',
    values: ['freelance', 'accountant', 'sme', 'large_enterprise'],
    required: true,
  },
  roles: {
    type: 'Array',
    of: 'String',
    default: ['user'], // Default role
    required: true,
    // Example roles: ['user', 'admin']
  },
  created_at: {
    type: 'Timestamp',
    default: 'now()', // Or a function to get current timestamp
  },
  updated_at: {
    type: 'Timestamp',
    default: 'now()', // Or a function to get current timestamp
  },
};

// Example of how it might be used with an ORM (conceptual)
// const User = defineModel('User', userSchema);

// module.exports = User;

// For now, just exporting the schema an object
module.exports = userSchema;
