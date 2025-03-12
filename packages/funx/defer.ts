export type IDefer<ResultType = void> = {
  promise: Promise<ResultType>;
  resolved: boolean;
  rejected: boolean;
  pending: boolean;
  resolve(value: ResultType | PromiseLike<ResultType>): void;
  reject(reason?: unknown): void;
};

export function Defer<ResultType = void>(): IDefer<ResultType> {
  const deferred = {
    rejected: false,
    resolved: false,
    pending: true,
  } as IDefer<ResultType>;

  deferred.promise = new Promise<ResultType>((resolve, reject) => {
    deferred.resolve = (data: any) => {
      if (deferred.resolved || deferred.rejected) {
        return;
      }

      deferred.pending = false;
      deferred.resolved = true;
      resolve(data);
    };

    deferred.reject = (error: any) => {
      if (deferred.resolved || deferred.rejected) {
        return;
      }

      deferred.pending = false;
      deferred.rejected = true;
      reject(error);
    };
  });

  return deferred;
}

export type IDataDefer<
  DataType = any,
  ResultType = void,
> = IDefer<ResultType> & {
  data: DataType;
};

export function DeferData<DataType = void, ResultType = void>(
  data: DataType,
): IDataDefer<DataType, ResultType> {
  const deferred = Defer<ResultType>();

  return {
    ...deferred,
    data,
  };
}
