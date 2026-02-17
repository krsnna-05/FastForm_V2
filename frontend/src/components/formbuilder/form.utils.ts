const applyOperation = (form, operation) => {
  const updatedForm = {
    title: "",
    description: "",
    fields: [],
    ...form,
  };

  console.log("Applying operation:", operation);

  if (operation.type === "update_title") {
    updatedForm.title = operation.title;
    return updatedForm;
  }

  if (operation.type === "update_description") {
    updatedForm.description = operation.description;
    return updatedForm;
  }

  if (operation.type === "add_field") {
    const { field } = operation;
    return addField(updatedForm, field);
  }

  if (operation.type === "delete_field") {
    const { id, index } = operation;
    return deleteField(updatedForm, id, index);
  }

  console.log("Updated form after applying operation:", updatedForm);

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
    (existing) => (existing.id || existing._id) === field.id,
  );

  let nextField;

  if (fieldType === "text" || fieldType === "para") {
    nextField = {
      id: field.id,
      type: fieldType,
      label: field.label,
      required: field.required,
      location: insertIndex,
    };
  } else if (fieldType === "radio" || fieldType === "checkbox") {
    nextField = {
      id: field.id,
      type: fieldType,
      label: field.label,
      required: field.required,
      options: field.options || [],
      location: insertIndex,
    };
  }

  if (nextField) {
    if (existingIndex >= 0) {
      form.fields[existingIndex] = nextField;
    } else {
      form.fields.splice(insertIndex, 0, nextField);
    }
  }

  return { ...form };
};

const deleteField = (form, fieldId, fieldIndex) => {
  if (
    typeof fieldIndex === "number" &&
    fieldIndex >= 0 &&
    fieldIndex < form.fields.length
  ) {
    form.fields = form.fields.filter((_, idx) => idx !== fieldIndex);
  } else {
    form.fields = form.fields.filter((field) => {
      const id = field.id || field._id;
      return id !== fieldId;
    });
  }
  return { ...form };
};

export { applyOperation };
