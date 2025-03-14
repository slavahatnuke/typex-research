import { IType, IUseType } from '@slavax/typex';
import { useState } from 'react';

export enum LoaderState {
  Pending = 'Pending',
  Resolving = 'Resolving',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

type New<
  DataType,
  ErrorType,
  T extends IType<{ type: LoaderState }> & {
    pending: boolean;
    resolving: boolean;
    resolved: boolean;

    loading: boolean;
    loaded: boolean;

    failed: boolean;
    rejected: boolean;

    data: DataType | null;

    error: ErrorType | null;
    rejection: ErrorType | null;
  },
> = IType<T>;

export type ILoaderState<DataType, ErrorType> =
  | New<
      DataType,
      ErrorType,
      {
        type: LoaderState.Pending;

        resolving: false;
        resolved: false;
        pending: true;
        loading: false;
        loaded: false;
        failed: false;
        rejected: false;

        data: null;
        error: null;
        rejection: null;
      }
    >
  | New<
      DataType,
      ErrorType,
      {
        type: LoaderState.Resolving;
        pending: false;
        resolving: true;
        resolved: false;
        loading: true;
        loaded: false;
        failed: false;
        rejected: false;
        data: null;
        error: null;
        rejection: null;
      }
    >
  | New<
      DataType,
      ErrorType,
      {
        type: LoaderState.Resolved;
        pending: false;
        resolving: false;
        resolved: true;
        loading: false;
        loaded: true;
        failed: false;
        rejected: false;
        data: DataType;
        error: null;
        rejection: null;
      }
    >
  | New<
      DataType,
      ErrorType,
      {
        type: LoaderState.Rejected;
        pending: false;
        resolving: false;
        resolved: false;
        loading: false;
        loaded: false;
        failed: true;
        rejected: true;
        data: null;
        error: ErrorType;
        rejection: ErrorType;
      }
    >;

export function useLoader<DataType, ErrorType>(
  initialState?: ILoaderState<DataType, ErrorType>,
) {
  const [state, setState] = useState<ILoaderState<DataType, ErrorType>>(
    initialState ?? LoaderStatePending(),
  );

  const resolve = (data: DataType) => {
    setState(LoaderStateResolved(data));
  };

  const reject = (error: ErrorType) => {
    setState(LoaderStateRejected(error));
  };

  return [state, resolve, reject] as const;
}

export function LoaderStatePending<DataType, ErrorType>(): IUseType<
  ILoaderState<DataType, ErrorType>,
  LoaderState.Pending
> {
  return {
    type: LoaderState.Pending,
    pending: true,
    resolved: false,
    resolving: false,
    loading: false,
    loaded: false,
    failed: false,
    rejected: false,
    data: null,
    error: null,
    rejection: null,
  };
}

export function LoaderStateResolving<DataType, ErrorType>(): IUseType<
  ILoaderState<DataType, ErrorType>,
  LoaderState.Resolving
> {
  return {
    type: LoaderState.Resolving,
    resolved: false,
    pending: false,
    resolving: true,
    loading: true,
    loaded: false,
    failed: false,
    rejected: false,
    data: null,
    error: null,
    rejection: null,
  };
}

export function LoaderStateResolved<DataType, ErrorType>(
  data: DataType,
): IUseType<ILoaderState<DataType, ErrorType>, LoaderState.Resolved> {
  return {
    type: LoaderState.Resolved,
    resolved: true,
    pending: false,
    resolving: false,
    loading: false,
    loaded: true,
    failed: false,
    rejected: false,
    data,
    error: null,
    rejection: null,
  };
}

export function LoaderStateRejected<DataType, ErrorType>(
  error: ErrorType,
): IUseType<ILoaderState<DataType, ErrorType>, LoaderState.Rejected> {
  return {
    type: LoaderState.Rejected,
    pending: false,
    resolving: false,
    resolved: false,
    loading: false,
    loaded: false,
    failed: true,
    rejected: true,
    data: null,
    error,
    rejection: error,
  };
}
