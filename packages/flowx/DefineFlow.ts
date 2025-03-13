import { IPromise, IType, IUseType, NewError } from '@slavax/typex';
import { FlowSpec, IFlowSpecEntity, IFlowSpecValue, UseSpec } from './index';
import { fastId, INewId } from '@slavax/funx/fastId';

type IWhenOutput = Readonly<{
  then: (input: UseSpec<FlowSpec.Then>['handler']) => IWhenOutput;
  catch: (input: UseSpec<FlowSpec.Catch>['handler']) => IWhenOutput;
}>;
export type IFlowDefinitionLanguage = {
  command: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Command> & IFlowDefinitionMeta; // command

  event: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Event> & IFlowDefinitionMeta; // event

  query: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Query> & IFlowDefinitionMeta; // query

  value: <Type = unknown>(
    name: string,
    title?: string,
  ) => IFlowSpecValue<Type> & IFlowDefinitionMeta; // value

  entity: <Type = unknown>(
    name: string,
    identity?: (entity: Type) => IPromise<string>,
    title?: string,
  ) => IFlowSpecEntity<Type> & IFlowDefinitionMeta; // value

  when: <Subject extends UseSpec<FlowSpec.When>['subject']>(
    subject: Subject,
  ) => IWhenOutput; // when

  resolve: <Subject extends UseSpec<FlowSpec.Resolve>['subject']>(
    subject: Subject,
    handler: UseSpec<FlowSpec.Resolve>['handler'],
  ) => UseSpec<FlowSpec.Resolve>; // resolve

  reject: <Subject extends UseSpec<FlowSpec.Reject>['subject']>(
    subject: Subject,
    handler: UseSpec<FlowSpec.Reject>['handler'],
  ) => UseSpec<FlowSpec.Reject>; // reject

  happened: <
    Subject extends
      | UseSpec<FlowSpec.Happened>['subject']
      | UseSpec<FlowSpec.Event>,
  >(
    subject: Subject,
  ) => UseSpec<FlowSpec.Happened>; // happened

  requested: <Subject extends UseSpec<FlowSpec.Requested>['subject']>(
    subject: Subject,
  ) => UseSpec<FlowSpec.Requested>; // requested

  resolved: <Subject extends UseSpec<FlowSpec.Resolved>['subject']>(
    subject: Subject,
  ) => UseSpec<FlowSpec.Resolved>; // resolved

  rejected: <Subject extends UseSpec<FlowSpec.Rejected>['subject']>(
    subject: Subject,
  ) => UseSpec<FlowSpec.Rejected>; // rejected
};

type IFlowDefinition = UseSpec<
  | FlowSpec.Command
  | FlowSpec.Query
  | FlowSpec.Event
  | FlowSpec.When
  | FlowSpec.Value
  | FlowSpec.Entity
>;

export type IFlowDefinitionMeta = Readonly<{ id: string; meta: unknown }>;
export type IDefineFlowOutput = IFlowDefinition & IFlowDefinitionMeta;

type UseDefineFlowOutput<Type extends IDefineFlowOutput['type']> = IUseType<
  IDefineFlowOutput,
  Type
>;

export type IDefineFlow = (
  specifier: (language: IFlowDefinitionLanguage) => unknown,
) => IDefineFlowOutput[];

export function DefineFlow<Meta = undefined>(
  meta: Meta,
  { NewId = fastId }: Partial<{ NewId: INewId }> = {},
): IDefineFlow {
  return function defineFlow(
    specifier: (language: IFlowDefinitionLanguage) => unknown,
  ) {
    const outputs: IDefineFlowOutput[] = [];

    function throwErrorIfNotSpecifying() {
      if (!specifying) {
        throw ImpossibleToSpecifyError({});
      }
    }

    const add = <Type extends IFlowDefinition>(
      output: Type,
    ): Type & IFlowDefinitionMeta => {
      throwErrorIfNotSpecifying();

      const item = {
        ...output,
        id: String(NewId()),
        meta,
      };

      outputs.push(item);

      return item;
    };

    const WhenOutput = (
      when: UseDefineFlowOutput<FlowSpec.When>,
    ): IWhenOutput => {
      return {
        then: (input) => {
          throwErrorIfNotSpecifying();

          when.steps.push({
            type: FlowSpec.Then,
            whenId: when.id,
            handler: input,
          });

          return WhenOutput(when);
        },
        catch: (input) => {
          throwErrorIfNotSpecifying();

          when.steps.push({
            type: FlowSpec.Catch,
            whenId: when.id,
            handler: input,
          });

          return WhenOutput(when);
        },
      };
    };

    let specifying = true;
    try {
      specifier({
        command: (name, title) =>
          add({
            type: FlowSpec.Command,
            name,
            title: title ?? '',
          }),

        event: (name, title) =>
          add({
            type: FlowSpec.Event,
            name,
            title: title ?? '',
          }),

        query: (name, title) =>
          add({
            type: FlowSpec.Query,
            name,
            title: title ?? '',
          }),

        value: (name, title) =>
          add({
            type: FlowSpec.Value,
            name,
            title: title ?? '',
          }),

        entity: (
          name: string,
          identity?: (entity: any) => IPromise<string>,
          title?: string,
        ) =>
          add({
            type: FlowSpec.Entity,
            name,
            title: title ?? '',
            identity,
          }),

        when: (subject) => {
          const when = add({
            type: FlowSpec.When,
            subject,
            steps: [],
          });

          return WhenOutput(when);
        },

        resolve: (subject, handler) => ({
          type: FlowSpec.Resolve,
          subject,
          handler,
        }),

        reject: (subject, handler) => ({
          type: FlowSpec.Reject,
          subject,
          handler,
        }),

        happened: (subject) => ({
          type: FlowSpec.Happened,
          subject,
        }),

        requested: (subject) => ({
          type: FlowSpec.Requested,
          subject,
        }),

        resolved: (subject) => ({
          type: FlowSpec.Resolved,
          subject,
        }),

        rejected: (subject) => ({
          type: FlowSpec.Rejected,
          subject,
        }),
      });
    } finally {
      specifying = false;
    }

    return outputs;
  };
}

enum DefineFlowError {
  ImpossibleToSpecifyError = 'ImpossibleToSpecifyError',
}

type IDefineFlowError = IType<{
  type: DefineFlowError.ImpossibleToSpecifyError;
}>;

const ImpossibleToSpecifyError = NewError<IDefineFlowError>(
  DefineFlowError.ImpossibleToSpecifyError,
);
