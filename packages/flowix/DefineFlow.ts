import { IPromise } from '@repo/typex';
import { fastId } from './fun/fastId';
import { FlowSpec, UseSpec } from './index';

export type IFlowIXToolkit = {
  emit: (event: UseSpec<FlowSpec.Event>, payload: unknown) => IPromise;
};

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

  when: <Subject extends UseSpec<FlowSpec.When>['subject']>(
    subject: Subject,
  ) => Readonly<{
    then: (
      input: UseSpec<FlowSpec.Then>['then'],
    ) => UseSpec<FlowSpec.Then> & IFlowDefinitionMeta;
  }>; // when

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
  | FlowSpec.Then
>;

export type IFlowDefinitionMeta = Readonly<{ id: string; meta: unknown }>;
export type IDefineFlowOutput = IFlowDefinition & IFlowDefinitionMeta;

export type IDefineFlow = (
  specifier: (language: IFlowDefinitionLanguage) => unknown,
) => IDefineFlowOutput[];

export function DefineFlow<Meta = undefined>(
  meta: Meta,
  { NewId = fastId }: Partial<{ NewId: () => string }> = {},
): IDefineFlow {
  return function defineFlow(
    specifier: (language: IFlowDefinitionLanguage) => unknown,
  ) {
    const outputs: IDefineFlowOutput[] = [];

    const add = <Type extends IFlowDefinition>(
      output: Type,
    ): Type & IFlowDefinitionMeta => {
      const item = {
        ...output,
        id: NewId(),
        meta,
      };
      outputs.push(item);
      return item;
    };

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

      when: (subject) => {
        const when = add({
          type: FlowSpec.When,
          subject,
        });
        return {
          then: (input) =>
            add({
              type: FlowSpec.Then,
              when: when,
              then: input,
            }),
        };
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

    return outputs;
  };
}
