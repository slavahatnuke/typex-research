import { IType, IUseType } from '@slavax/typex';
import { useState } from 'react';

export enum LoaderStatus {
  Pending = 'Pending',
  Resolving = 'Resolving',
  Resolved = 'Resolved',
  Rejected = 'Rejected',
}

type New<
  DataType,
  ErrorType,
  T extends IType<{ type: LoaderStatus }> & {
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

export type ILoaderStatus<DataType, ErrorType> =
  | New<
      DataType,
      ErrorType,
      {
        type: LoaderStatus.Pending;

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
        type: LoaderStatus.Resolving;
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
        type: LoaderStatus.Resolved;
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
        type: LoaderStatus.Rejected;
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
  initialState?: ILoaderStatus<DataType, ErrorType>,
) {
  const [state, setState] = useState<ILoaderStatus<DataType, ErrorType>>(
    initialState ?? LoaderStatusPending(),
  );

  const resolve = (data: DataType) => {
    setState(LoaderStatusResolved(data));
  };

  const reject = (error: ErrorType) => {
    setState(LoaderStatusRejected(error));
  };

  return [state, resolve, reject] as const;
}

export function LoaderStatusPending<DataType, ErrorType>(): IUseType<
  ILoaderStatus<DataType, ErrorType>,
  LoaderStatus.Pending
> {
  return {
    type: LoaderStatus.Pending,
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

export function LoaderStatusResolving<DataType, ErrorType>(): IUseType<
  ILoaderStatus<DataType, ErrorType>,
  LoaderStatus.Resolving
> {
  return {
    type: LoaderStatus.Resolving,
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

export function LoaderStatusResolved<DataType, ErrorType>(
  data: DataType,
): IUseType<ILoaderStatus<DataType, ErrorType>, LoaderStatus.Resolved> {
  return {
    type: LoaderStatus.Resolved,
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

export function LoaderStatusRejected<DataType, ErrorType>(
  error: ErrorType,
): IUseType<ILoaderStatus<DataType, ErrorType>, LoaderStatus.Rejected> {
  return {
    type: LoaderStatus.Rejected,
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
