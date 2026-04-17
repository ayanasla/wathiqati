const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const validateTaskInput = (title, description, deadline) => {
  const errors = [];
  
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (title && title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (deadline && new Date(deadline) < new Date()) {
    errors.push('Deadline cannot be in the past');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateDocumentInput = (title) => {
  const errors = [];
  
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (title && title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePaginationParams = (limit, offset) => {
  const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const parsedOffset = Math.max(parseInt(offset) || 0, 0);
  
  return {
    limit: parsedLimit,
    offset: parsedOffset,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateTaskInput,
  validateDocumentInput,
  validatePaginationParams,
};
