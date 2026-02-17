import FormPreview from "@/components/formbuilder/FormPreview";
import SideBar from "@/components/formbuilder/SideBar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "react-router";
import { DefaultChatTransport, type UIMessage } from "ai";

import type { Form } from "@/types/Form";
import { v4 as uuidv4 } from "uuid";
import { applyOperation } from "@/components/formbuilder/form.utils";
import useAuthStore from "@/store/auth.store";

const API_ENDPOINT = "http://localhost:3000/api/form/edit";
const FORM_FETCH_ENDPOINT = "http://localhost:3000/api/form";

const FormBuilder = () => {
  const { User } = useAuthStore();

  const [form, setForm] = useState<Form>({
    _id: "",
    userId: "",
    title: "",
    description: "",
    fields: [],
    createdAt: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingForm, setIsFetchingForm] = useState(false);
  const hasInitializedRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: API_ENDPOINT,
      }),
    [],
  );

  useEffect(() => {
    setForm((prev) => ({ ...prev, userId: User?.userId || "" }));
  }, [User?.userId]);

  const { messages, setMessages, sendMessage } = useChat({
    transport,
  });

  const [searchParams] = useSearchParams();
  const formId = searchParams.get("formId");

  useEffect(() => {
    if (!formId || !User?.userId) {
      return;
    }

    const createFormRequest = JSON.parse(
      localStorage.getItem(`fastform_create_form_${formId}`) || "{}",
    );

    if (createFormRequest?.prompt) {
      return;
    }

    const controller = new AbortController();

    const fetchForm = async () => {
      setIsFetchingForm(true);

      try {
        const url = new URL(`${FORM_FETCH_ENDPOINT}/${formId}`);
        url.searchParams.set("userId", User?.userId || "");

        const res = await fetch(url.toString(), {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(res.statusText || "Failed to fetch form");
        }

        const payload = await res.json();
        if (payload?.data) {
          const normalized = {
            ...payload.data,
            fields: Array.isArray(payload.data.fields)
              ? payload.data.fields.map((field: any, index: number) => ({
                  ...field,
                  type: field.type || field.fieldType || "text",
                  location:
                    typeof field.location === "number" ? field.location : index,
                  createdAt: field.createdAt
                    ? new Date(field.createdAt)
                    : new Date(),
                }))
              : [],
          };

          setForm(normalized);
        }
      } catch (error: any) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch form:", error);
      } finally {
        setIsFetchingForm(false);
      }
    };

    fetchForm();

    return () => controller.abort();
  }, [formId, User?.userId]);

  const handleSend = async (
    prompt: string,
    mode: "ask" | "agent",
    req: "create" | "edit",
  ) => {
    if (req === "edit" && !formId) {
      console.error("Missing formId for edit request");
      return;
    }

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
        formId: formId,
        userId: User?.userId || "",
        request: req,
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

    handleSend(createFormRequest.prompt, "agent", "create");
  }, [formId, form, sendMessage, messages]);

  useEffect(() => {}, [form]);

  const isBusy = isLoading || isFetchingForm;

  return (
    <div className="flex h-screen">
      <SideBar
        messages={messages}
        setMessages={setMessages}
        sendMessage={sendMessage}
        onSend={handleSend}
        form={form}
        isLoading={isBusy}
        formId={formId}
      />
      <FormPreview form={form} isLoading={isBusy} />
    </div>
  );
};

export default FormBuilder;
