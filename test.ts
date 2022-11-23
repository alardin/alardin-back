import 'reflect-metadata';

const createMapping = (method: string) => (path: string) => {
  return (target, key, desc: PropertyDescriptor) => {
    const handler: Function = desc.value;
    Reflect.defineMetadata('test', 'hihi', desc.value);
    desc.value = (...args) => {
      console.log(`${method} handler`);
      console.log(`path: ${path}`);
      handler.call(this, args);
    };
  };
};

function d(target) {
  console.log(target);
}

const Get = createMapping('get');

@Reflect.metadata('test', 'hihi')
class Cat {
  constructor() {}
  @Get('sarah')
  @Reflect.metadata('test', 'hihi')
  get(query) {
    console.log(`query: ${query}`);
  }
}

const a = new Cat();
const r = Reflect.getMetadata('test', Cat);
console.log(r);
a.get('?id=1');

function* makeRangeIterator(
  start = 0,
  end = 10,
  step = 1,
): IterableIterator<number> {
  let n = 0;
  for (let i = start; i < end; i += step) {
    n++;
    console.log(n);
    yield i;
  }
  return n;
}

function makeRangeIterator2(start = 0, end = 10, step = 1) {
  var nextIndex = start;
  var n = 0;

  var rangeIterator = {
    next: function () {
      var result;
      if (nextIndex < end) {
        result = { value: nextIndex, done: false };
      } else if (nextIndex == end) {
        result = { value: n, done: true };
      } else {
        result = { done: true };
      }
      nextIndex += step;
      n++;
      return result;
    },
  };
  return rangeIterator;
}

console.log(makeRangeIterator2());
