export interface Asset { };

export class PreloadedAsset implements Asset {
  readonly url: string;

  private loadedBase64Url: string | null = null;

  constructor(url: string) {
    this.url = url;

    // Avoid name collisions with 'this' in the callback
    const self = this;
    const getResource = async () => {
      // Load the resource
      const blob = await (await fetch(self.url)).blob();

      // Create the data URL
      const dataURL = URL.createObjectURL(blob);

      self.loadedBase64Url = dataURL;
    };

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
