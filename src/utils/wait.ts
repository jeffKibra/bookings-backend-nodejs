export default function wait(ms: number = 1) {
  return new Promise(resolve => {
    console.log(`waiting for ${ms}ms ...`);
    setTimeout(() => {
      console.log('waiting ended!');
      resolve(ms);
    }, ms);
  });
}
