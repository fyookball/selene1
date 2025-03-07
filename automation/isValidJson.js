function isValidJSON(inputString) {
  try {
    JSON.parse(inputString);
    return true;
  } catch (error) {
    return false;
  }
}

export default isValidJSON;
