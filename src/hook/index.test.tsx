import {
  renderHook,
  act,
  waitFor,
  cleanup,
  render,
  fireEvent,
} from "@testing-library/react";
import { RemixFormProvider, useRemixForm, useRemixFormContext } from "./index";
import React from "react";
import { useFetcher, type Navigation } from "@remix-run/react";

const submitMock = vi.fn();
const fetcherSubmitMock = vi.fn();

const useNavigationMock = vi.hoisted(() =>
  vi.fn<() => Pick<Navigation, "state" | "formData">>(() => ({
    state: "idle",
    formData: undefined,
  })),
);

vi.mock("@remix-run/react", () => ({
  useSubmit: () => submitMock,
  useActionData: () => ({}),
  useFetcher: () => ({ submit: fetcherSubmitMock, data: {} }),
  useNavigation: useNavigationMock,
}));

describe("useRemixForm", () => {
  it("should return all the same output that react-hook-form returns", () => {
    const { result } = renderHook(() => useRemixForm({}));
    expect(result.current.register).toBeInstanceOf(Function);
    expect(result.current.unregister).toBeInstanceOf(Function);
    expect(result.current.setValue).toBeInstanceOf(Function);
    expect(result.current.getValues).toBeInstanceOf(Function);
    expect(result.current.trigger).toBeInstanceOf(Function);
    expect(result.current.reset).toBeInstanceOf(Function);
    expect(result.current.clearErrors).toBeInstanceOf(Function);
    expect(result.current.setError).toBeInstanceOf(Function);
    expect(result.current.formState).toEqual({
      disabled: false,
      dirtyFields: {},
      isDirty: false,
      isSubmitSuccessful: false,
      isSubmitted: false,
      isSubmitting: false,
      isValid: false,
      isValidating: false,
      validatingFields: {},
      touchedFields: {},
      submitCount: 0,
      isLoading: false,
      errors: {},
    });
    expect(result.current.handleSubmit).toBeInstanceOf(Function);
  });

  it("should call onSubmit function when the form is valid", async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();

    const { result } = renderHook(() =>
      useRemixForm({
        resolver: () => ({ values: {}, errors: {} }),
        submitHandlers: {
          onValid,
          onInvalid,
        },
      }),
    );

    act(() => {
      result.current.handleSubmit({} as any);
    });
    await waitFor(() => {
      expect(onValid).toHaveBeenCalled();
    });
  });

  it("should reset isSubmitSuccessful after submission if reset is called", async () => {
    const { result } = renderHook(() =>
      useRemixForm({
        resolver: () => ({ values: {}, errors: {} }),
      }),
    );

    act(() => {
      result.current.handleSubmit({} as any);
    });
    await waitFor(() => {
      expect(result.current.formState.isSubmitSuccessful).toBe(true);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.formState.isSubmitSuccessful).toBe(false);
  });

  it("should submit the form data to the server when the form is valid", async () => {
    const { result } = renderHook(() =>
      useRemixForm({
        resolver: () => ({ values: {}, errors: {} }),
        submitConfig: {
          action: "/submit",
        },
      }),
    );

    act(() => {
      result.current.handleSubmit({} as any);
    });
    await waitFor(() => {
      expect(submitMock).toHaveBeenCalledWith(expect.any(FormData), {
        method: "post",
        action: "/submit",
      });
    });
  });

  it("should submit the form data to the server using a fetcher when the form is valid", async () => {
    const {
      result: { current: fetcher },
    } = renderHook(() => useFetcher());
    const { result } = renderHook(() =>
      useRemixForm({
        fetcher,
        resolver: () => ({ values: {}, errors: {} }),
        submitConfig: {
          action: "/submit",
        },
      }),
    );

    act(() => {
      result.current.handleSubmit({} as any);
    });
    await waitFor(() => {
      expect(fetcherSubmitMock).toHaveBeenCalledWith(expect.any(FormData), {
        method: "post",
        action: "/submit",
      });
    });
  });

  it("should not re-render on validation if isValidating is not being accessed", async () => {
    const renderHookWithCount = () => {
      let count = 0;
      const renderCount = () => count;
      const result = renderHook(() => {
        count++;
        return useRemixForm({
          mode: "onChange",
          resolver: () => ({
            values: {
              name: "",
            },
            errors: {},
          }),
        });
      });
      return { renderCount, ...result };
    };

    const { result, renderCount } = renderHookWithCount();

    await act(async () => {
      result.current.setValue("name", "John", { shouldValidate: true });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setValue("name", "Bob", { shouldValidate: true });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(renderCount()).toBe(1);
  });

  it("should re-render on validation if isValidating is being accessed", async () => {
    const renderHookWithCount = () => {
      let count = 0;
      const renderCount = () => count;
      const result = renderHook(() => {
        count++;
        return useRemixForm({
          mode: "onChange",
          resolver: () => ({
            values: {
              name: "",
            },
            errors: {},
          }),
        });
      });
      return { renderCount, ...result };
    };

    const { result, renderCount } = renderHookWithCount();

    // Accessing isValidating
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isValidating = result.current.formState.isValidating;

    await act(async () => {
      result.current.setValue("name", "John", { shouldValidate: true });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      result.current.setValue("name", "Bob", { shouldValidate: true });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(renderCount()).toBe(3);
  });

  it("should not flash incorrect isSubmitting status", async () => {
    submitMock.mockReset();
    useNavigationMock.mockClear();

    const { result, rerender } = renderHook(() =>
      useRemixForm({
        resolver: () => ({ values: {}, errors: {} }),
        submitConfig: {
          action: "/submit",
        },
      }),
    );

    expect(result.current.formState.isSubmitting).toBe(false);

    act(() => {
      result.current.handleSubmit({} as any);
    });
    expect(result.current.formState.isSubmitting).toBe(true);

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));

    expect(result.current.formState.isSubmitting).toBe(true);

    expect(submitMock).toHaveBeenCalledWith(expect.any(FormData), {
      method: "post",
      action: "/submit",
    });

    useNavigationMock.mockReturnValue({
      state: "submitting",
      formData: new FormData(),
    });
    rerender();

    expect(result.current.formState.isSubmitting).toBe(true);

    useNavigationMock.mockReturnValue({ state: "idle", formData: undefined });
    rerender();

    expect(result.current.formState.isSubmitting).toBe(false);
  });
});

afterEach(cleanup);

describe("RemixFormProvider", () => {
  it("should allow the user to submit via the useRemixForm handleSubmit using the context", () => {
    const { result } = renderHook(() =>
      useRemixForm({
        resolver: () => ({ values: {}, errors: {} }),
        submitConfig: {
          action: "/submit",
        },
      }),
    );
    const spy = vi.spyOn(result.current, "handleSubmit");

    const TestComponent = () => {
      const { handleSubmit } = useRemixFormContext();
      return <form onSubmit={handleSubmit} data-testid="test"></form>;
    };

    const { getByTestId } = render(
      <RemixFormProvider {...result.current}>
        <TestComponent />
      </RemixFormProvider>,
    );

    const form = getByTestId("test") as HTMLFormElement;
    fireEvent.submit(form);

    expect(spy).toHaveBeenCalled();
  });
});
