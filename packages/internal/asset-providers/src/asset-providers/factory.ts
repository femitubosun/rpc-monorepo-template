import type {
  AssetProvider,
  ProviderConfig,
  ProviderFactory,
} from './__defs__';

export const createProviderFactory = (
  providers: Record<string, new (config: any) => AssetProvider>
): ProviderFactory => {
  return (config: ProviderConfig): AssetProvider | null => {
    const ProviderClass = providers[config.provider];
    if (!ProviderClass) {
      return null;
    }
    return new ProviderClass(config);
  };
};
