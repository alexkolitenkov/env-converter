function isCamelCase(str) {
  return !!str.match(/^[a-z]+[A-Z]/);
}

function camelToSnakeCase(str) {
  if (isCamelCase(str)) {
    return str.replace(/[A-Z]/g, '_$&').toUpperCase();
  }
  return str.toUpperCase();
}

export function build(obj, key, prefix = '', service = '') {
  let exportString = '';

  if (typeof obj[key] === 'number' || typeof obj[key] === 'boolean') {
    exportString +=
      `${prefix ? prefix + '_' : ''}${service ? service + '_' : ''}${camelToSnakeCase(key)}=${obj[key]}\n`;
  } else if (typeof obj[key] === 'string') {
    exportString +=
      `${prefix ? prefix + '_' : ''}${service ? service + '_' : ''}${camelToSnakeCase(key)}='${obj[key]}'\n`;
  } else if (typeof obj[key] === 'object') {
    for (const k in obj[key]) {
      exportString += build(obj[key], k, `${prefix ? prefix + '_' : ''}${service ? service + '_' : ''}${key.toUpperCase()}`);
    }
  }
  return exportString;
}

// Function to safely parse JSON or JS-like objects
export function safeParseInput(input) {
  try {
    // Attempt to parse as JSON directly
    return JSON.parse(input);
  } catch {
    // If JSON.parse fails, attempt to evaluate the input as JS code
    try {
      // Use Function constructor instead of eval for safety
      const cleanedInput = input.trim();
      return new Function(`return (${cleanedInput})`)();
    } catch (e) {
      alert(`Invalid input! Ensure it's a valid JSON or JS-like object.`);
      throw e; // Stop execution
    }
  }
}