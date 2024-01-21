const storeInSession = (key, value) => {
  return sessionStorage.setItem(key, value);
};

const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};

const deleteFromSession = (key) => {
  return sessionStorage.removeItem(key);
};

export { storeInSession, lookInSession, deleteFromSession };
