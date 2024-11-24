async function wait(time, times_ = 1) {
  if (times_ < 0 || times_ === 0 || Math.floor(times_) !== times_) return;
  let times = times_;
  await new Promise((res) => {
    const intervale = setInterval(() => {
      times--;
      if (times === 0) {
        clearInterval(intervale);
        res();
      }
    }, time);
  });
}

async function until(funct, { times = 1, wait = 0, async = true }, catcher) {
  if (times < 0 || times === 0 || Math.floor(times) !== times) return;
  let times_ = times;
  return new Promise((res, rej) => {
    const intervale = setInterval(async () => {
      if (async) {
        try {
          await funct((returnedValue) => {
            clearInterval(intervale);
            res(returnedValue);
          }, rej);
        } catch (e) {
          console.log(e);
        }
      } else {
        funct((returnedValue) => {
          clearInterval(intervale);
          res(returnedValue);
        }, rej);
      }

      times--;
      if (times_ === 0) {
        clearInterval(intervale);
        rej();
      }
    }, wait);
  }).catch((e) => {
    console.log(e);
    if (catcher) catcher();
  });
}
