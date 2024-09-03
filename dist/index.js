// src/utilities/index.ts
var tryParseJSON = (jsonString) => {
  try {
    const json = JSON.parse(jsonString);
    return json;
  } catch (e) {
    return jsonString;
  }
};
var generateFormData = (formData, preserveStringified = false) => {
  const outputObject = {};
  for (const [key, value] of formData.entries()) {
    const data = preserveStringified ? value : tryParseJSON(value.toString());
    const keyParts = key.split(".");
    let currentObject = outputObject;
    for (let i = 0; i < keyParts.length - 1; i++) {
      const keyPart = keyParts[i];
      if (!currentObject[keyPart]) {
        currentObject[keyPart] = /^\d+$/.test(keyParts[i + 1]) ? [] : {};
      }
      currentObject = currentObject[keyPart];
    }
    const lastKeyPart = keyParts[keyParts.length - 1];
    const lastKeyPartIsArray = /\[\d*\]$|\[\]$/.test(lastKeyPart);
    if (lastKeyPartIsArray) {
      const key2 = lastKeyPart.replace(/\[\d*\]$|\[\]$/, "");
      if (!currentObject[key2]) {
        currentObject[key2] = [];
      }
      currentObject[key2].push(data);
    }
    if (!lastKeyPartIsArray) {
      if (/^\d+$/.test(lastKeyPart)) {
        currentObject.push(data);
      } else {
        currentObject[lastKeyPart] = data;
      }
    }
  }
  return outputObject;
};
var getFormDataFromSearchParams = (request, preserveStringified = false) => {
  const searchParams = new URL(request.url).searchParams;
  return generateFormData(searchParams, preserveStringified);
};
var isGet = (request) => request.method === "GET" || request.method === "get";
var getValidatedFormData = async (request, resolver, preserveStringified = false) => {
  const data = "url" in request && isGet(request) ? getFormDataFromSearchParams(request, preserveStringified) : await parseFormData(request, preserveStringified);
  const validatedOutput = await validateFormData(data, resolver);
  return { ...validatedOutput, receivedValues: data };
};
var validateFormData = async (data, resolver) => {
  const dataToValidate = data instanceof FormData ? Object.fromEntries(data) : data;
  const { errors, values } = await resolver(
    dataToValidate,
    {},
    { shouldUseNativeValidation: false, fields: {} }
  );
  if (Object.keys(errors).length > 0) {
    return { errors, data: void 0 };
  }
  return { errors: void 0, data: values };
};
var createFormData = (data, stringifyAll = true) => {
  const formData = new FormData();
  if (!data) {
    return formData;
  }
  for (const [key, value] of Object.entries(data)) {
    if (value === void 0) {
      continue;
    }
    if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value[i]);
      }
      continue;
    }
    if (value instanceof Array && value.length > 0 && (value[0] instanceof File || value[0] instanceof Blob)) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value[i]);
      }
      continue;
    }
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      continue;
    }
    if (stringifyAll) {
      formData.append(key, JSON.stringify(value));
      continue;
    }
    if (typeof value === "string") {
      formData.append(key, value);
      continue;
    }
    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      continue;
    }
    formData.append(key, JSON.stringify(value));
  }
  return formData;
};
var parseFormData = async (request, preserveStringified = false) => {
  const formData = request instanceof Request ? await request.formData() : request;
  return generateFormData(formData, preserveStringified);
};

// src/hook/index.tsx
import {
  useActionData,
  useNavigation,
  useSubmit
} from "react-router-dom";
import React, {
  useEffect,
  useMemo,
  useState
} from "react";
import {
  FormProvider,
  get,
  useForm,
  useFormContext
} from "react-hook-form";
var useRemixForm = ({
  submitHandlers,
  submitConfig,
  submitData,
  fetcher,
  stringifyAllValues = true,
  ...formProps
}) => {
  var _a, _b;
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const actionSubmit = useSubmit();
  const actionData = useActionData();
  const submit = (_a = fetcher == null ? void 0 : fetcher.submit) != null ? _a : actionSubmit;
  const data = (_b = fetcher == null ? void 0 : fetcher.data) != null ? _b : actionData;
  const methods = useForm({ ...formProps, errors: data == null ? void 0 : data.errors });
  const navigation = useNavigation();
  const isSubmittingForm = useMemo(
    () => Boolean(
      navigation.state !== "idle" && navigation.formData !== void 0 || (fetcher == null ? void 0 : fetcher.state) !== "idle" && (fetcher == null ? void 0 : fetcher.formData) !== void 0
    ),
    [navigation.state, navigation.formData, fetcher == null ? void 0 : fetcher.state, fetcher == null ? void 0 : fetcher.formData]
  );
  const [isSubmittingNetwork, setIsSubmittingNetwork] = useState(false);
  useEffect(() => {
    if (!isSubmittingForm) {
      setIsSubmittingNetwork(false);
    }
  }, [isSubmittingForm]);
  const onSubmit = useMemo(
    () => (data2, e, formEncType, formMethod, formAction) => {
      var _a2, _b2, _c, _d;
      setIsSubmittingNetwork(true);
      setIsSubmittedSuccessfully(true);
      const encType = (_a2 = submitConfig == null ? void 0 : submitConfig.encType) != null ? _a2 : formEncType;
      const method = (_c = (_b2 = submitConfig == null ? void 0 : submitConfig.method) != null ? _b2 : formMethod) != null ? _c : "post";
      const action = (_d = submitConfig == null ? void 0 : submitConfig.action) != null ? _d : formAction;
      const submitPayload = { ...data2, ...submitData };
      const formData = encType === "application/json" ? submitPayload : createFormData(submitPayload, stringifyAllValues);
      submit(formData, {
        ...submitConfig,
        method,
        encType,
        action
      });
    },
    [submit, submitConfig, submitData, stringifyAllValues]
  );
  const onInvalid = useMemo(() => () => {
  }, []);
  const formState = useMemo(
    () => ({
      get isDirty() {
        return methods.formState.isDirty;
      },
      get isLoading() {
        return methods.formState.isLoading;
      },
      get isSubmitted() {
        return methods.formState.isSubmitted;
      },
      get isSubmitSuccessful() {
        return isSubmittedSuccessfully || methods.formState.isSubmitSuccessful;
      },
      get isSubmitting() {
        return isSubmittingNetwork || methods.formState.isSubmitting;
      },
      get isValidating() {
        return methods.formState.isValidating;
      },
      get isValid() {
        return methods.formState.isValid;
      },
      get disabled() {
        return methods.formState.disabled;
      },
      get submitCount() {
        return methods.formState.submitCount;
      },
      get defaultValues() {
        return methods.formState.defaultValues;
      },
      get dirtyFields() {
        return methods.formState.dirtyFields;
      },
      get touchedFields() {
        return methods.formState.touchedFields;
      },
      get validatingFields() {
        return methods.formState.validatingFields;
      },
      get errors() {
        return methods.formState.errors;
      }
    }),
    [methods.formState, isSubmittedSuccessfully, isSubmittingNetwork]
  );
  const reset = useMemo(
    () => (values, options) => {
      setIsSubmittedSuccessfully(false);
      methods.reset(values, options);
    },
    [methods.reset]
  );
  const register = useMemo(
    () => (name, options) => {
      var _a2;
      const defaultValue = (_a2 = get(data == null ? void 0 : data.defaultValues, name)) != null ? _a2 : get(methods.formState.defaultValues, name);
      return {
        ...methods.register(name, options),
        ...!(options == null ? void 0 : options.disableProgressiveEnhancement) && {
          defaultValue: typeof defaultValue === "string" ? defaultValue : void 0,
          defaultChecked: typeof defaultValue === "boolean" ? defaultValue : void 0
        }
      };
    },
    [methods.register, data == null ? void 0 : data.defaultValues, methods.formState.defaultValues]
  );
  const handleSubmit = useMemo(
    () => (e) => {
      var _a2, _b2, _c, _d, _e;
      const encType = (_a2 = e == null ? void 0 : e.currentTarget) == null ? void 0 : _a2.enctype;
      const method = (_b2 = e == null ? void 0 : e.currentTarget) == null ? void 0 : _b2.method;
      const action = (_c = e == null ? void 0 : e.currentTarget) == null ? void 0 : _c.action;
      const onValidHandler = (_d = submitHandlers == null ? void 0 : submitHandlers.onValid) != null ? _d : onSubmit;
      const onInvalidHandler = (_e = submitHandlers == null ? void 0 : submitHandlers.onInvalid) != null ? _e : onInvalid;
      return methods.handleSubmit(
        (data2, e2) => onValidHandler(data2, e2, encType, method, action),
        onInvalidHandler
      )(e);
    },
    [methods.handleSubmit, submitHandlers, onSubmit, onInvalid]
  );
  const hookReturn = useMemo(
    () => ({
      ...methods,
      handleSubmit,
      reset,
      register,
      formState
    }),
    [methods, handleSubmit, reset, register, formState]
  );
  return hookReturn;
};
var RemixFormProvider = ({
  children,
  ...props
}) => {
  return /* @__PURE__ */ React.createElement(FormProvider, { ...props }, children);
};
var useRemixFormContext = () => {
  const methods = useFormContext();
  return {
    ...methods,
    handleSubmit: methods.handleSubmit
  };
};
export {
  RemixFormProvider,
  createFormData,
  generateFormData,
  getFormDataFromSearchParams,
  getValidatedFormData,
  parseFormData,
  useRemixForm,
  useRemixFormContext,
  validateFormData
};
