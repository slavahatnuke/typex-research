import { IService } from '@slavax/typex';
import { NewReactProvider } from './NewReactProvider';

export function ServiceNativeProvider<Service extends IService<any, any, any>>(
  name: string,
  service: Service,
) {
  const [Provider, useProvider] = NewReactProvider<Service>(name);
  return [Provider, useProvider] as const;
}
