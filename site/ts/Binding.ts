import { DeepReadonly } from "./utils";

export type BindingBackerDoAsyncConfig = {
  needsToWait: boolean;
};

export abstract class BindingBacker<T> {
  protected _value: T | null;
  protected _prevValue: T | null = null;

  private currentTask: Promise<void> = Promise.resolve();

  constructor(value?: T | null) {
    this._value = value ?? null;
  }

  get value(): T | null {
    return this._value;
  }

  get prevValue(): T | null {
    return this._prevValue
  }

  set value(to: T | null) {
    this._prevValue = this._value;
    this._value = to;
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

export interface Binding<V, B> {
  readonly getfn: (this: DeepReadonly<BindingBacker<B>>, dispatcher?: string) => V;

  readonly backing: BindingBacker<B>;
  readonly initialBacking: DeepReadonly<B> | null;

  getValue(dispatcher?: string): V | null;

  runSet(): void;

  get value(): V | null;
}

export class GeneralBinding<V, B> implements Binding<V, B> {
  readonly setfn: (
    this: BindingBacker<B>,
    to: V,
    dispatcher?: string,
  ) => void;
  readonly getfn: (this: DeepReadonly<BindingBacker<B>>, dispatcher?: string) => V;

  readonly initialBacking: DeepReadonly<B> | null = null;
  readonly backing: BindingBacker<B> =
    new (class extends BindingBacker<B> { })(null);

  constructor(options: {
    backing?: B | null;
    setfn(this: BindingBacker<B>, to: V, dispatcher?: string): void;
    getfn(this: DeepReadonly<BindingBacker<B>>, dispatcher?: string): V;
  }) {
    this.initialBacking = options.backing ?? null;
    this.backing.value = options.backing ?? null;
    this.getfn = options.getfn;
    this.setfn = options.setfn;
  }

  public getValue(dispatcher?: string): V {
    return this.getfn.call(this.backing, dispatcher);
  }

  public setValue(to: V, dispatcher?: string) {
    this.setfn.call(this.backing, to, dispatcher);
  }

  /**
   * Runs the set function setup for the Binding with the value returned by Binding.getValue(dispatcher: "binding-internal")
   */
  public runSet() {
    this.setfn.call(this.backing, this.getValue(), "binding-internal")
  }

  get value(): V {
    return this.getValue();
  }

  set value(to: V) {
    this.setValue(to);
  }
}

export class ImmutableBinding<V> {
  private readonly getfn: (this: ImmutableBinding<V>, dispatcher?: string) => V;

  constructor(options: {
    getfn(this: ImmutableBinding<V>, dispatcher?: string): V;
  }) {
    this.getfn = options.getfn;
  }

  public getValue(dispatcher?: string): V {
    return this.getfn.call(this, dispatcher);
  }

  get value(): V {
    return this.getValue();
  }
}
