export type BindingBackerDoAsyncConfig = {
  needsToWait: boolean;
};

export abstract class BindingBacker<T> {
  backedBinding: Binding<any, T>;

  private currentTask: Promise<void> = Promise.resolve();

  abstract getBacking(): T | null;
  abstract getPreviousBacking(): T | null;
  abstract setBacking(to: T): void;

  constructor(backedBinding: Binding<any, T>) {
    this.backedBinding = backedBinding;
  }

  /**
   * Will perform a task once the previously begun task is complete (when cfg.needsToWait is true).
   * The returned promsie resolves once the task is finished.
   * @param task The task to perform.
   */
  async doAsync(
    cfg: BindingBackerDoAsyncConfig,
    task: (this: BindingBacker<T>) => Promise<void>,
  ): Promise<void> {
    if (cfg.needsToWait) {
      await this.currentTask;
    }

    return new Promise((res, rej) => {
      this.currentTask = task
        .call(this)
        .then(() => res())
        .catch((reason) => rej(reason));
    });
  }
}

export class Binding<V, B> {
  private readonly setfn: (
    this: BindingBacker<B>,
    to: V,
    dispatcher?: string,
  ) => void;
  private readonly getfn: (this: BindingBacker<B>, dispatcher?: string) => V;

  private backing: B | null;

  readonly binderBacking: BindingBacker<B> =
    new (class extends BindingBacker<B> {
      private prev: B | null = null

      getBacking(): B | null {
        return this.backedBinding.backing;
      }

      getPreviousBacking(): B | null {
        return this.prev
      }

      setBacking(to: B) {
        this.prev = this.getBacking()
        this.backedBinding.backing = to;
      }

      constructor(backedBinding: Binding<any, B>) {
        super(backedBinding);
      }
    })(this);

  constructor(options: {
    backing?: B | null;
    setfn(this: BindingBacker<B>, to: V, dispatcher?: string): void;
    getfn(this: BindingBacker<B>, dispatcher?: string): V;
  }) {
    this.backing = options.backing ?? null;
    this.getfn = options.getfn;
    this.setfn = options.setfn;
  }

  public getValue(dispatcher?: string): V {
    return this.getfn.call(this.binderBacking, dispatcher);
  }

  public setValue(to: V, dispatcher?: string) {
    this.setfn.call(this.binderBacking, to, dispatcher);
  }

  get value(): V {
    return this.getValue();
  }

  set value(to: V) {
    this.setValue(to);
  }
}
