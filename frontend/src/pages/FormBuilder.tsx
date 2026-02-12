import FormPreview from "@/components/formbuilder/FormPreview";
import SideBar from "@/components/formbuilder/SideBar";
import React, { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "react-router";
import { useNavigate } from "react-router";

const FormBuilder = () => {
  const { messages, setMessages } = useChat();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const formId = searchParams.get("formId");

  const fetchandSetForm = async () => {};

  useEffect(() => {
    const createFormRequest = JSON.parse(
      localStorage.getItem(`fastform_create_form_${formId}`) || "{}",
    );

    localStorage.removeItem(`fastform_create_form_${formId}`);

    console.log("Create Form Request:", createFormRequest);

    if (!createFormRequest.prompt) {
      fetchandSetForm();
    }
  }, []);

  return (
    <div className=" flex h-screen ">
      <SideBar messages={messages} setMessages={setMessages} />
      <FormPreview />
    </div>
  );
};

export default FormBuilder;
