export interface Asset { };

export class CachedAsset implements Asset {
  readonly url: string;

  private loadedBase64Url: string | null = null;

  constructor(url: string) {
    this.url = url;

    // Avoid name collisions with 'this' in the callback
    const self = this;
    const getResource: (this: CachedAsset) => Promise<void> = (async () => {
      const cache = await caches.open("v3-nightly");
      const cached = await cache.match(self.url);

      if (cached == null) {
        await cache.add(self.url);

        return await (getResource.bind(self))();
      }

      // Get the blob
      const blob = await cached.blob();

      // Create the data URL
      const dataURL = URL.createObjectURL(blob);

      this.loadedBase64Url = dataURL;
    }).bind(this);

    // Check if we can request an idle callback
    if ("requestIdleCallback" in window) {
      requestIdleCallback(getResource, {})
    } else {
      // This is about as similar as we can get
      setTimeout(getResource, 0)
    }
  }

  public get loadedUrl(): string {
    return this.loadedBase64Url ?? this.url
  }

  public async load(): Promise<Blob> {
    return await (await fetch(this.loadedUrl)).blob();
  }
}
