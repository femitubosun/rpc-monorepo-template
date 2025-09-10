import { makeLogger } from '@template/logging';
import type {
  AssetProvider,
  ProviderConfig,
  ProviderFactory,
} from './__defs__';

class AssetProviderManager {
  #logger = makeLogger('AssetProviderManager');
  #providers = new Map<string, AssetProvider>();
  #factory: ProviderFactory | null = null;

  setFactory(factory: ProviderFactory) {
    this.#factory = factory;
  }

  getProvider(config: ProviderConfig): AssetProvider | null {
    const key = `${config.provider}-${config.multipartThreshold || 'default'}`;

    if (this.#providers.has(key)) {
      return this.#providers.get(key)!;
    }

    if (!this.#factory) {
      this.#logger.error('No provider factory configured');
      return null;
    }

    const provider = this.#factory(config);

    if (provider) {
      this.#providers.set(key, provider);
    }

    return provider;
  }

  clearCache() {
    this.#providers.clear();
  }
}

export const assetProviderManager = new AssetProviderManager();
