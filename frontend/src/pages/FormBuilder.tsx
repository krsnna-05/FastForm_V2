import FormPreview from "@/components/formbuilder/FormPreview";
import SideBar from "@/components/formbuilder/SideBar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "react-router";
import { DefaultChatTransport, type UIMessage } from "ai";

import type { Form } from "@/types/Form";

const API_ENDPOINT = "http://localhost:3000/api/form/edit";

const FormBuilder = () => {
  const [form, setForm] = useState<Form | {}>({});
  const hasInitializedRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: API_ENDPOINT,
      }),
    [],
  );

  const { messages, setMessages, sendMessage } = useChat({
    transport,
  });

  const [searchParams] = useSearchParams();
  const formId = searchParams.get("formId");

  const fetchandSetForm = async () => {};

  useEffect(() => {
    if (hasInitializedRef.current || !formId) {
      return;
    }

    hasInitializedRef.current = true;

    const createFormRequest = JSON.parse(
      localStorage.getItem(`fastform_create_form_${formId}`) || "{}",
    );

    localStorage.removeItem(`fastform_create_form_${formId}`);

    console.log("Create Form Request:", createFormRequest);

    if (!createFormRequest || !createFormRequest.prompt) return;

    const intialMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [
        {
          type: "text",
          text:
            createFormRequest.prompt ||
            "Create a form with a single text input field and a submit button.",
        },
      ],
    };

    sendMessage(intialMessage, {
      body: { request: "create_form", form: form, aiMode: "agent" },
    });

    if (!createFormRequest.prompt) {
      fetchandSetForm();
    }
  }, [formId, form, sendMessage]);

  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  return (
    <div className="flex h-screen">
      <SideBar
        messages={messages}
        setMessages={setMessages}
        sendMessage={sendMessage}
        form={form}
      />
      <FormPreview />
    </div>
  );
};

export default FormBuilder;
