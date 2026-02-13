const applyOperation = (form, operations) => {
  const updatedForm = {
    title: "",
    description: "",
    fields: [],
    ...form,
  };

  if (operations.type === "update_title") {
    updatedForm.title = operations.title;
  }

  if (operations.type === "update_description") {
    updatedForm.description = operations.description;
  }

  if (operations.type === "add_field") {
    const { field } = operations;
    return addField(updatedForm, field);
  }

  if (operations.type === "delete_field") {
    const { id } = operations;
    return deleteField(updatedForm, id);
  }

  return updatedForm;
};

const addField = (form, field) => {
  if (!Array.isArray(form.fields)) {
    form.fields = [];
  }

  const fieldType = field.fieldType ?? field.type;
  const insertIndex =
    typeof field.location === "number" ? field.location : form.fields.length;

  const existingIndex = form.fields.findIndex(
    (existing) => existing.id === field.id,
  );

  if (fieldType === "text" || fieldType === "para") {
    const nextField = {
      id: field.id,
      type: fieldType,
      label: field.label,
      required: field.required,
    };

    if (existingIndex >= 0) {
      form.fields[existingIndex] = nextField;
    } else {
      form.fields.splice(insertIndex, 0, nextField);
    }
  } else if (fieldType === "radio" || fieldType === "checkbox") {
    const nextField = {
      id: field.id,
      type: fieldType,
      label: field.label,
      required: field.required,
      options: field.options || [],
    };

    if (existingIndex >= 0) {
      form.fields[existingIndex] = nextField;
    } else {
      form.fields.splice(insertIndex, 0, nextField);
    }
  }

  return form;
};

const deleteField = (form, fieldId) => {
  form.fields = form.fields.filter((field) => field.id !== fieldId);
  return form;
};

export { applyOperation };
