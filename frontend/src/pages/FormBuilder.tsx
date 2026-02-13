import FormPreview from "@/components/formbuilder/FormPreview";
import SideBar from "@/components/formbuilder/SideBar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "react-router";
import { DefaultChatTransport, type UIMessage } from "ai";

import type { Form } from "@/types/Form";
import { v4 as uuidv4 } from "uuid";
import { applyOperation } from "@/components/formbuilder/form.utils";

const API_ENDPOINT = "http://localhost:3000/api/form/edit";

const FormBuilder = () => {
  const [form, setForm] = useState<Form | {}>({
    title: "",
    description: "",
    fields: [],
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSend = async (prompt: string, mode: "ask" | "agent") => {
    setIsLoading(true);
    const newMessages: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [
        {
          type: "text",
          text: prompt,
        },
      ],
    };

    setMessages((prev) => [...prev, newMessages]);

    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form,
        messages: [...messages, newMessages],
        aiMode: mode,
      }),
    });

    if (res.ok && mode === "ask") {
      const reader = res.body?.getReader();

      if (!reader) {
        console.error("No reader available on response body");
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      const newMessageId = uuidv4() as string;

      let messageBuffer: string = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed) {
            continue;
          }

          const payload = trimmed.startsWith("data:")
            ? trimmed.slice("data:".length).trim()
            : trimmed;

          if (!payload) {
            continue;
          }

          let parsed: any;
          try {
            parsed = JSON.parse(payload);
          } catch (error) {
            console.warn("Skipping non-JSON payload:", payload, error);
            continue;
          }

          if (parsed.type === "text-delta") {
            messageBuffer += parsed.delta;
            const updatedText = messageBuffer;

            const nextMessage: UIMessage = {
              id: newMessageId,
              role: "assistant",
              parts: [
                {
                  type: "text",
                  text: updatedText,
                },
              ],
            };

            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== newMessageId),
              nextMessage,
            ]);
          }
        }
      }
      setIsLoading(false);
    } else if (res.ok && mode === "agent") {
      const reader = res.body?.getReader();

      if (!reader) {
        console.error("No reader available on response body");
        return;
      }

      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      const newMessageId = uuidv4() as string;
      let messageBuffer: string = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();

        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          let parsed: any;
          try {
            parsed = JSON.parse(trimmed);
          } catch (error) {
            console.warn("Skipping non-JSON payload:", trimmed, error);
            continue;
          }
          if (parsed.type === "assistant_text") {
            messageBuffer += parsed.delta || "";

            const nextMessage: UIMessage = {
              id: newMessageId,
              role: "assistant",
              parts: [
                {
                  type: "text",
                  text: messageBuffer,
                },
              ],
            };

            setMessages((prev) => [
              ...prev.filter((msg) => msg.id !== newMessageId),
              nextMessage,
            ]);
            continue;
          }

          if (parsed.type === "done") {
            setIsLoading(false);
            continue;
          }

          setForm((prevForm) => applyOperation(prevForm, parsed));
        }
      }
      setIsLoading(false);
    } else {
      console.error("Error response from server:", res.statusText);
      setIsLoading(false);
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

    if (!createFormRequest || !createFormRequest.prompt) return;

    handleSend(createFormRequest.prompt, "agent");

    if (!createFormRequest.prompt) {
      fetchandSetForm();
    }
  }, [formId, form, sendMessage, messages]);

  useEffect(() => {}, [form]);

  return (
    <div className="flex h-screen">
      <SideBar
        messages={messages}
        setMessages={setMessages}
        sendMessage={sendMessage}
        onSend={handleSend}
        form={form}
        isLoading={isLoading}
      />
      <FormPreview form={form} isLoading={isLoading} />
    </div>
  );
};

export default FormBuilder;
