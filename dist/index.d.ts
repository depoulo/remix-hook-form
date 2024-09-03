import * as react_hook_form from 'react-hook-form';
import { FieldValues, Resolver, FieldErrors, UseFormProps, SubmitHandler, SubmitErrorHandler, DefaultValues, KeepStateOptions, Path, RegisterOptions, FormState, UseFormHandleSubmit, UseFormReturn } from 'react-hook-form';
import { SubmitFunction, FetcherWithComponents } from 'react-router';
import React, { FormEvent, ReactNode } from 'react';

/**
 * Generates an output object from the given form data, where the keys in the output object retain
 * the structure of the keys in the form data. Keys containing integer indexes are treated as arrays.
 *
 * @param {FormData} formData - The form data to generate an output object from.
 * @param {boolean} [preserveStringified=false] - Whether to preserve stringified values or try to convert them
 * @returns {Object} The output object generated from the form data.
 */
declare const generateFormData: (formData: FormData | URLSearchParams, preserveStringified?: boolean) => Record<any, any>;
declare const getFormDataFromSearchParams: (request: Pick<Request, "url">, preserveStringified?: boolean) => Record<any, any>;
/**
 * Parses the data from an HTTP request and validates it against a schema. Works in both loaders and actions, in loaders it extracts the data from the search params.
 * In actions it extracts it from request formData.
 *
 * @async
 * @param {Request} request - An object that represents an HTTP request.
 * @param validator - A function that resolves the schema.
 * @param {boolean} [preserveStringified=false] - Whether to preserve stringified values or try to convert them
 * @returns A Promise that resolves to an object containing the validated data or any errors that occurred during validation.
 */
declare const getValidatedFormData: <T extends FieldValues>(request: Request | FormData, resolver: Resolver<T>, preserveStringified?: boolean) => Promise<{
    receivedValues: Record<any, any>;
    errors: FieldErrors<T>;
    data: undefined;
} | {
    receivedValues: Record<any, any>;
    errors: undefined;
    data: T;
}>;
/**
 * Helper method used in actions to validate the form data parsed from the frontend using zod and return a json error if validation fails.
 * @param data Data to validate
 * @param resolver Schema to validate and cast the data with
 * @returns Returns the validated data if successful, otherwise returns the error object
 */
declare const validateFormData: <T extends FieldValues>(data: any, resolver: Resolver<T>) => Promise<{
    errors: FieldErrors<T>;
    data: undefined;
} | {
    errors: undefined;
    data: T;
}>;
/**
  Creates a new instance of FormData with the specified data and key.
  @template T - The type of the data parameter. It can be any type of FieldValues.
  @param {T} data - The data to be added to the FormData. It can be either an object of type FieldValues.
  @param {boolean} stringifyAll - Should the form data be stringified or not (default: true) eg: {a: '"string"', b: "1"} vs {a: "string", b: "1"}
  @returns {FormData} - The FormData object with the data added to it.
*/
declare const createFormData: <T extends FieldValues>(data: T, stringifyAll?: boolean) => FormData;
/**
Parses the specified Request object's FormData to retrieve the data associated with the specified key.
Or parses the specified FormData to retrieve the data
@template T - The type of the data to be returned.
@param {Request | FormData} request - The Request object whose FormData is to be parsed.
@param {boolean} [preserveStringified=false] - Whether to preserve stringified values or try to convert them
@returns {Promise<T>} - A promise that resolves to the data of type T.
@throws {Error} - If no data is found for the specified key, or if the retrieved data is not a string.
*/
declare const parseFormData: <T extends unknown>(request: Request | FormData, preserveStringified?: boolean) => Promise<T>;

type SubmitFunctionOptions = Parameters<SubmitFunction>[1];
interface UseRemixFormOptions<T extends FieldValues> extends UseFormProps<T> {
    submitHandlers?: {
        onValid?: SubmitHandler<T>;
        onInvalid?: SubmitErrorHandler<T>;
    };
    submitConfig?: SubmitFunctionOptions;
    submitData?: FieldValues;
    fetcher?: FetcherWithComponents<unknown>;
    /**
     * If true, all values will be stringified before being sent to the server, otherwise everything but strings will be stringified (default: true)
     */
    stringifyAllValues?: boolean;
}
declare const useRemixForm: <T extends FieldValues>({ submitHandlers, submitConfig, submitData, fetcher, stringifyAllValues, ...formProps }: UseRemixFormOptions<T>) => {
    handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
    reset: (values?: T | DefaultValues<T> | undefined, options?: KeepStateOptions) => void;
    register: (name: Path<T>, options?: RegisterOptions<T> & {
        disableProgressiveEnhancement?: boolean;
    }) => {
        defaultValue?: string | undefined;
        defaultChecked?: boolean | undefined;
        onChange: react_hook_form.ChangeHandler;
        onBlur: react_hook_form.ChangeHandler;
        ref: react_hook_form.RefCallBack;
        name: Path<T>;
        min?: string | number;
        max?: string | number;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        required?: boolean;
        disabled?: boolean;
    };
    formState: FormState<T>;
    watch: react_hook_form.UseFormWatch<T>;
    getValues: react_hook_form.UseFormGetValues<T>;
    getFieldState: react_hook_form.UseFormGetFieldState<T>;
    setError: react_hook_form.UseFormSetError<T>;
    clearErrors: react_hook_form.UseFormClearErrors<T>;
    setValue: react_hook_form.UseFormSetValue<T>;
    trigger: react_hook_form.UseFormTrigger<T>;
    resetField: react_hook_form.UseFormResetField<T>;
    unregister: react_hook_form.UseFormUnregister<T>;
    control: react_hook_form.Control<T, any>;
    setFocus: react_hook_form.UseFormSetFocus<T>;
};
type UseRemixFormReturn = ReturnType<typeof useRemixForm>;
interface RemixFormProviderProps<T extends FieldValues> extends Omit<UseFormReturn<T>, "handleSubmit" | "reset"> {
    children: ReactNode;
    handleSubmit: any;
    register: any;
    reset: any;
}
declare const RemixFormProvider: <T extends FieldValues>({ children, ...props }: RemixFormProviderProps<T>) => React.JSX.Element;
declare const useRemixFormContext: <T extends FieldValues>() => {
    handleSubmit: ReturnType<UseFormHandleSubmit<T>>;
    watch: react_hook_form.UseFormWatch<T>;
    getValues: react_hook_form.UseFormGetValues<T>;
    getFieldState: react_hook_form.UseFormGetFieldState<T>;
    setError: react_hook_form.UseFormSetError<T>;
    clearErrors: react_hook_form.UseFormClearErrors<T>;
    setValue: react_hook_form.UseFormSetValue<T>;
    trigger: react_hook_form.UseFormTrigger<T>;
    formState: FormState<T>;
    resetField: react_hook_form.UseFormResetField<T>;
    reset: react_hook_form.UseFormReset<T>;
    unregister: react_hook_form.UseFormUnregister<T>;
    control: react_hook_form.Control<T, any>;
    register: react_hook_form.UseFormRegister<T>;
    setFocus: react_hook_form.UseFormSetFocus<T>;
};

export { RemixFormProvider, SubmitFunctionOptions, UseRemixFormOptions, UseRemixFormReturn, createFormData, generateFormData, getFormDataFromSearchParams, getValidatedFormData, parseFormData, useRemixForm, useRemixFormContext, validateFormData };
