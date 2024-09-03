"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  RemixFormProvider: () => RemixFormProvider,
  createFormData: () => createFormData,
  generateFormData: () => generateFormData,
  getFormDataFromSearchParams: () => getFormDataFromSearchParams,
  getValidatedFormData: () => getValidatedFormData,
  parseFormData: () => parseFormData,
  useRemixForm: () => useRemixForm,
  useRemixFormContext: () => useRemixFormContext,
  validateFormData: () => validateFormData
});
module.exports = __toCommonJS(src_exports);

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
  Object.entries(data).map(([key, value]) => {
    if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value[i]);
      }
      return;
    }
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else {
      if (stringifyAll) {
        formData.append(key, JSON.stringify(value));
      } else {
        if (typeof value === "string") {
          formData.append(key, value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, JSON.stringify(value));
        }
      }
    }
  });
  return formData;
};
var parseFormData = async (request, preserveStringified = false) => {
  const formData = request instanceof Request ? await request.formData() : request;
  return generateFormData(formData, preserveStringified);
};

// src/hook/index.tsx
var import_react = __toESM(require("react"), 1);
var import_react_router_dom = require("react-router-dom");
var import_react_hook_form = require("react-hook-form");
var useRemixForm = ({
  submitHandlers,
  submitConfig,
  submitData,
  fetcher,
  stringifyAllValues = true,
  ...formProps
}) => {
  var _a, _b;
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = (0, import_react.useState)(false);
  const actionSubmit = (0, import_react_router_dom.useSubmit)();
  const actionData = (0, import_react_router_dom.useActionData)();
  const submit = (_a = fetcher == null ? void 0 : fetcher.submit) != null ? _a : actionSubmit;
  const data = (_b = fetcher == null ? void 0 : fetcher.data) != null ? _b : actionData;
  const methods = (0, import_react_hook_form.useForm)({ ...formProps, errors: data == null ? void 0 : data.errors });
  const navigation = (0, import_react_router_dom.useNavigation)();
  const isSubmittingForm = (0, import_react.useMemo)(
    () => Boolean(
      navigation.state !== "idle" && navigation.formData !== void 0 || fetcher && fetcher.state !== "idle" && fetcher.formData !== void 0
    ),
    [navigation.state, navigation.formData, fetcher == null ? void 0 : fetcher.state, fetcher == null ? void 0 : fetcher.formData]
  );
  const [isSubmittingNetwork, setIsSubmittingNetwork] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (!isSubmittingForm) {
      setIsSubmittingNetwork(false);
    }
  }, [isSubmittingForm]);
  const onSubmit = (0, import_react.useMemo)(
    () => (data2, e, formEncType, formMethod) => {
      var _a2, _b2, _c;
      setIsSubmittingNetwork(true);
      setIsSubmittedSuccessfully(true);
      const encType = (_a2 = submitConfig == null ? void 0 : submitConfig.encType) != null ? _a2 : formEncType;
      const method = (_c = (_b2 = submitConfig == null ? void 0 : submitConfig.method) != null ? _b2 : formMethod) != null ? _c : "post";
      const submitPayload = { ...data2, ...submitData };
      const formData = encType === "application/json" ? submitPayload : createFormData(submitPayload, stringifyAllValues);
      submit(formData, {
        ...submitConfig,
        method,
        encType
      });
    },
    [submit, submitConfig, submitData, stringifyAllValues]
  );
  const onInvalid = (0, import_react.useMemo)(() => () => {
  }, []);
  const formState = (0, import_react.useMemo)(
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
  const reset = (0, import_react.useMemo)(
    () => (values, options) => {
      setIsSubmittedSuccessfully(false);
      methods.reset(values, options);
    },
    [methods.reset]
  );
  const register = (0, import_react.useMemo)(
    () => (name, options) => {
      var _a2, _b2;
      return {
        ...methods.register(name, options),
        ...!(options == null ? void 0 : options.disableProgressiveEnhancement) && {
          defaultValue: (_b2 = (_a2 = data == null ? void 0 : data.defaultValues) == null ? void 0 : _a2[name]) != null ? _b2 : ""
        }
      };
    },
    [methods.register, data == null ? void 0 : data.defaultValues]
  );
  const handleSubmit = (0, import_react.useMemo)(
    () => (e) => {
      var _a2, _b2, _c, _d;
      const encType = (_a2 = e == null ? void 0 : e.currentTarget) == null ? void 0 : _a2.enctype;
      const method = (_b2 = e == null ? void 0 : e.currentTarget) == null ? void 0 : _b2.method;
      const onValidHandler = (_c = submitHandlers == null ? void 0 : submitHandlers.onValid) != null ? _c : onSubmit;
      const onInvalidHandler = (_d = submitHandlers == null ? void 0 : submitHandlers.onInvalid) != null ? _d : onInvalid;
      return methods.handleSubmit(
        (data2, e2) => onValidHandler(data2, e2, encType, method),
        onInvalidHandler
      )(e);
    },
    [methods.handleSubmit, submitHandlers, onSubmit, onInvalid]
  );
  const hookReturn = (0, import_react.useMemo)(
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
  return /* @__PURE__ */ import_react.default.createElement(import_react_hook_form.FormProvider, { ...props }, children);
};
var useRemixFormContext = () => {
  const methods = (0, import_react_hook_form.useFormContext)();
  return {
    ...methods,
    handleSubmit: methods.handleSubmit
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RemixFormProvider,
  createFormData,
  generateFormData,
  getFormDataFromSearchParams,
  getValidatedFormData,
  parseFormData,
  useRemixForm,
  useRemixFormContext,
  validateFormData
});
