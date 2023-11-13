function reformatDates(data: InvoiceFormData): InvoiceFormData {
  const { saleDate, dueDate } = data;
  const formData = {
    ...data,
    saleDate: new Date(saleDate),
    dueDate: new Date(dueDate),
  };

  return formData;
}
