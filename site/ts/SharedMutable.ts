export class SharedMutable<T> {
  private instance: T

  constructor(initial: T) {
    this.instance = initial
  }

  getValue() {
    return this.instance
  }

  setValue(to: T) {
    this.instance = to
  }

  get value() {
    return this.getValue()
  }

  set value(to: T) {
    this.setValue(to)
  }
}
