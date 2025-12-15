const getErrorMessage = (error: any) => {
  if (error.response) {
    return error.response.data.errors[0].message;
  }
  return error.message;
};

export default getErrorMessage;
