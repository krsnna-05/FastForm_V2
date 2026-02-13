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

  const handleSend = async (message: UIMessage, mode: "ask" | "agent") => {
    if (mode === "ask") {
      sendMessage(message, {
        body: { request: "create_form", form, mode: "ask" },
      });
      return;
    }

    setMessages((prev) => [...prev, message]);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: "create_form",
          form,
          mode: "agent",
          messages: [...messages, message],
        }),
      });

      if (!response.body) {
        console.log("Agent response has no body.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";

        for (const line of parts) {
          if (line.trim()) {
            const result = JSON.parse(line);

            if (result.type === "update_title") {
              console.log("Updating title to:", result.title);

              setForm((prev) => ({ ...prev, title: result.title }));
            }

            if (result.type === "add_field") {
              console.log("Adding field:", result.field);
              setForm((prev) => ({
                ...prev,
                fields: [...((prev as Form).fields || []), result.field],
              }));
            }

            if (result.type === "done") {
              const finalMessage: UIMessage = {
                id: Date.now().toString(),
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: result.message,
                  },
                ],
              };

              console.log("Agent completed with message:", result.message);
              setMessages((prev) => [...prev, finalMessage]);
              return;
            }
          }
        }
      }

      if (buffer.trim()) {
        console.log("Agent stream:", buffer);
      }
    } catch (error) {
      console.log("Agent stream error:", error);
    }
  };

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

    handleSend(intialMessage, "agent");

    if (!createFormRequest.prompt) {
      fetchandSetForm();
    }
  }, [formId, form, sendMessage, messages]);

  useEffect(() => {
    console.log("Form state updated:", form);
  }, [form]);

  return (
    <div className="flex h-screen">
      <SideBar
        messages={messages}
        setMessages={setMessages}
        sendMessage={sendMessage}
        onSend={handleSend}
        form={form}
      />
      <FormPreview form={form} />
    </div>
  );
};

export default FormBuilder;
