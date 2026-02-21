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
const FORM_CREATE_ENDOPOINT = "http://localhost:3000/api/form/create";

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

  const { messages, setMessages } = useChat({
    transport,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const formId = searchParams.get("formId");
  const requestType = searchParams.get("request") as "create" | "edit" | null;

  if (!requestType) {
    return <div className="p-4">request type null</div>;
  } else if (requestType !== "create" && requestType !== "edit") {
    return <div className="p-4">invalid request type</div>;
  }

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
          const normalized: Form = {
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
            isConnectedToGoogleForm: !!payload.data.googleFormId,
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

    const createForm = async () => {
      try {
        const res = await fetch(FORM_CREATE_ENDOPOINT, {
          method: "POST",
          body: JSON.stringify({ formId, userId: User?.userId }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        let createResponseBody: unknown = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          createResponseBody = await res.json();
        }

        console.log("Create form response:", createResponseBody);

        if (!res.ok) {
          throw new Error(res.statusText || "Failed to create form");
        }

        setSearchParams(
          {
            formId,
            request: "edit",
          },
          { replace: true },
        );

        fetchForm();
      } catch (error) {
        console.error("Failed to create form:", error);
      }
    };

    if (requestType === "edit") {
      fetchForm();
    } else if (requestType === "create") {
      createForm();
    }

    return () => controller.abort();
  }, [formId, User?.userId, requestType]);

  const handleSend = async (prompt: string, req: "create" | "edit") => {
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
        formId: formId,
        userId: User?.userId || "",
        request: req,
      }),
    });

    if (res.ok) {
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

    handleSend(createFormRequest.prompt, "create");
  }, [formId, form, messages]);

  useEffect(() => {}, [form]);

  const isBusy = isLoading || isFetchingForm;

  return (
    <div className="flex h-screen">
      <SideBar
        messages={messages}
        onSend={handleSend}
        isLoading={isBusy}
        formId={formId}
      />
      <FormPreview form={form} setForm={setForm} isLoading={isBusy} />
    </div>
  );
};

export default FormBuilder;
