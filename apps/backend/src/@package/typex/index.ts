export type IType<Type extends { type: string } = { type: string }> = Readonly<Type>
export type IUseType<Unit extends IType, Type extends string> = Extract<Unit, { type: Type }>