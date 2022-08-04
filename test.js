function test() {
    let money = 0;
    setTimeout(() => {
        money = 50000;
    }, 5000);
    money -= 20000;
    console.log(money);
}
test();