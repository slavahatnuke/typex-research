import {
  EmitServiceEvent,
  ICommand,
  IEvent,
  IGetServiceEvents, NewError,
  Service,
  ServiceCall,
  ServiceFunction,
  ServiceFunctions,
} from '@slavax/typex';

export enum ClickHouseResearch {
  HiResearch = 'HiResearch',
  SaidHiResearcher = 'SaidHiResearcher',
}

type ISayHiResearcher = IEvent<{
  type: ClickHouseResearch.SaidHiResearcher;
  message: string;
}>;

type ISayHiResearch = ICommand<
  {
    type: ClickHouseResearch.HiResearch;
    name: string;
  },
  ISayHiResearcher,
  ISayHiResearcher
>;

export type IClickHouseResearch = ISayHiResearch;

export type IClickHouseContext = { userId: string };

export type IClickHouseEvents = IGetServiceEvents<IClickHouseResearch>;

const NotImplemented = NewError<{type: 'NotImplemented'}>('NotImplemented');

function HiResearch() {
  const hiResearch = ServiceFunction<ISayHiResearch>(async (input) => {
    throw NotImplemented({})
    // const event: IUseType<
    //   IClickHouseEvents,
    //   ClickHouseResearch.SaidHiResearcher
    // > = {
    //   type: ClickHouseResearch.SaidHiResearcher,
    //   message: `Hello, ${input.name}`,
    // };
    //
    // return await emit(input, ClickHouseResearch.SaidHiResearcher, event);
  });
  return hiResearch;
}

export function ClickHouseService() {
  const emit = EmitServiceEvent<IClickHouseEvents>();
  const call = ServiceCall<IClickHouseResearch, IClickHouseContext>();

  const hiResearch = HiResearch();

  return Service<IClickHouseResearch, IClickHouseContext>(
    ServiceFunctions<IClickHouseResearch>({
      [ClickHouseResearch.HiResearch]: hiResearch,
    }),
  );
}
