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

/*
                _
 ____ ___  ___ | |_  _   _
|_  // _ \/ __|| __|| | | |
 / /|  __/\__ \| |_ | |_| |
/___|\___||___/ \__| \__, |
                     |___/
        _        _     _
 _ __  (_)  ___ | | __| |
| '_ \ | | / __|| |/ /| | / _ \
| |_) || || (__ |   < | ||  __/
| .__/ |_| \___||_|\_\|_| \___|
|_|

*/
