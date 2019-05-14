

function a() {
//    this[0] = 1;
//    this[1] = 2;
};

v = new a();
v[0] = 10;
v[1] = 20;

if (undefined) {
    console.log("undef");
}

console.log(v[(1 > 2)>>0]);
console.log(v[(2 > 1)>>0]);
console.log(v[0]);
console.log(v[1]);
