const timer = (time) => {
    return new Promise((resolve, reject) => {
      console.log(`${time} 타이머 시작`);
      setTimeout(() => {
        console.log(`${time} 타이머 끝`);
        resolve();
      }, time);
    });
  };

async function runPromiseAll() {
const times = [1006, 1004, 1002, 1000];

await Promise.all(times.map((time) => timer(time)));

console.log('모든 타이머 끝');
}

runPromiseAll();