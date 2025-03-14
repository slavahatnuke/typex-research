import { IPromise, IType, IUseType, NewError } from '@slavax/typex';
import { FlowSpec, IFlowSpecEntity, IFlowSpecState, UseSpec } from './index';
import { fastId, INewId } from '@slavax/funx/fastId';

type IWhenOutput = Readonly<{
  then: (input: UseSpec<FlowSpec.Then>['handler']) => IWhenOutput;
  catch: (input: UseSpec<FlowSpec.Catch>['handler']) => IWhenOutput;
}>;
export type ISpecifyFlowLanguage = {
  command: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Command> & ISpecifyFlowMeta; // command

  event: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Event> & ISpecifyFlowMeta; // event

  query: (
    name: string,
    title?: string,
  ) => UseSpec<FlowSpec.Query> & ISpecifyFlowMeta; // query

  state: <Type = unknown>(
    name: string,
    title?: string,
    identity?: (entity: Type) => IPromise<string>,
  ) => IFlowSpecState<Type> & ISpecifyFlowMeta; // value

  entity: <Type = unknown>(
    name: string,
    title?: string,
    identity?: (entity: Type) => IPromise<string>,
  ) => IFlowSpecEntity<Type> & ISpecifyFlowMeta; // value

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

type ISpecifyFlowDefinition = UseSpec<
  | FlowSpec.Command
  | FlowSpec.Query
  | FlowSpec.Event
  | FlowSpec.When
  | FlowSpec.State
  | FlowSpec.Entity
>;

export type ISpecifyFlowMeta = Readonly<{ id: string; meta: unknown }>;
export type ISpecifyFlowOutput = ISpecifyFlowDefinition & ISpecifyFlowMeta;

type UseSpecifyFlowOutput<Type extends ISpecifyFlowOutput['type']> = IUseType<
  ISpecifyFlowOutput,
  Type
>;

export type ISpecifyFlow = (
  specifier: (language: ISpecifyFlowLanguage) => unknown,
) => ISpecifyFlowOutput[];

export function SpecifyFlow<Meta = undefined>(
  meta: Meta,
  { NewId = fastId }: Partial<{ NewId: INewId }> = {},
): ISpecifyFlow {
  return function defineFlow(
    specifier: (language: ISpecifyFlowLanguage) => unknown,
  ) {
    const outputs: ISpecifyFlowOutput[] = [];

    function throwErrorIfNotSpecifying(value: any) {
      if (!specifying) {
        throw SpecifyingPhaseFinishedError({ value });
      }
    }

    const add = <Type extends ISpecifyFlowDefinition>(
      output: Type,
    ): Type & ISpecifyFlowMeta => {
      throwErrorIfNotSpecifying(output);

      const item = {
        ...output,
        id: String(NewId()),
        meta,
      };

      outputs.push(item);

      return item;
    };

    const WhenOutput = (
      when: UseSpecifyFlowOutput<FlowSpec.When>,
    ): IWhenOutput => {
      return {
        then: (input) => {
          throwErrorIfNotSpecifying(input);

          when.steps.push({
            type: FlowSpec.Then,
            whenId: when.id,
            handler: input,
          });

          return WhenOutput(when);
        },
        catch: (input) => {
          throwErrorIfNotSpecifying(input);

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

        state: (name, title) =>
          add({
            type: FlowSpec.State,
            name,
            title: title ?? '',
          }),

        entity: (
          name: string,
          title?: string,
          identity?: (entity: any) => IPromise<string>,
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

export enum SpecifyFlowError {
  SpecifyingPhaseFinishedError = 'SpecifyingPhaseFinishedError',
}

type ISpecifyingPhaseFinishedError = IType<{
  type: SpecifyFlowError.SpecifyingPhaseFinishedError;
  value: any;
}>;

export const SpecifyingPhaseFinishedError =
  NewError<ISpecifyingPhaseFinishedError>(
    SpecifyFlowError.SpecifyingPhaseFinishedError,
  );
